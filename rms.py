import os
import time
import json
import logging
from typing import Dict, Optional

import paho.mqtt.client as mqtt
from carreralib import ControlUnit  # WICHTIG: nur ControlUnit importieren
from carreralib.connection import TimeoutError as CuTimeoutError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# ---------------------------------------------------------------------------
# ENV / CONFIG
# ---------------------------------------------------------------------------

CU_DEVICE = "076123CC-BB75-6373-50E9-32C05B25B413"



# Nur Lap-Events – genau EIN Topic mit Runde + Sektorzeiten
TOPIC_LAP = "carrera/cu/lapTimes"

# Control-Topics vom Backend
TOPIC_SESSION_START = "race_control/sessions/start"
TOPIC_SESSION_STOP = "race_control/sessions/stop"
TOPIC_SESSION_ACTIVE = "race_control/sessions/active"


# ---------------------------------------------------------------------------
# MQTT Setup
# ---------------------------------------------------------------------------


def create_mqtt_client() -> mqtt.Client:
    client = mqtt.Client()
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    def on_connect(c, u, f, rc):
        if rc == 0:
            logging.info("MQTT connected")
        else:
            logging.error(f"MQTT connection failed rc={rc}")

    def on_disconnect(c, u, rc):
        logging.warning(f"MQTT disconnected rc={rc}")

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
    client.loop_start()
    return client


# ---------------------------------------------------------------------------
# CU → MQTT Bridge (Lap-Events mit Session-ID)
# ---------------------------------------------------------------------------


class CarreraMqttBridge:
    """
    Liest Timer-Events aus der Carrera Control Unit
    und publisht nach jeder vollständigen Runde ein Lap-Event
    mit LapTime + Sektor1 + Sektor2 + sessionId.
    """

    def __init__(self, device: str, mqtt_client: mqtt.Client):
        self.device = device
        self.mqtt = mqtt_client
        self.cu: Optional[ControlUnit] = None

        # Aktive Session-ID (vom Backend gesetzt)
        self.current_session_id: Optional[int] = None

        # Pro Controller-Adresse:
        self.last_s1_ts: Dict[int, Optional[int]] = {}
        self.last_s2_ts: Dict[int, Optional[int]] = {}
        self.lap_counter: Dict[int, int] = {}

        # MQTT-Control-Topics abonnieren
        self.setup_mqtt_subscriptions()

    # ---------------------------------------------------------------------
    def start_cu_race(self):
        """
        Triggert den offiziellen Rennstart an der Control Unit.
        Dadurch gehen auch die Startlichter / Startampel los.
        Entspricht im Prinzip dem Drücken der START-Taste an der CU.
        """
        if self.cu is None:
            logging.warning("CU not connected - cannot start race")
            return

        logging.info("Sending start command to CU ...")
        try:
            self.cu.start()
        except CuTimeoutError as e:
            logging.error(f"CU start timeout (BLE): {e} – ignoring and keeping bridge alive")
        except Exception as e:
            logging.error(f"Error while starting race on CU: {e}")

    def setup_mqtt_subscriptions(self):
        """
        Abonniert Control-Topics vom Backend, um sessionId zu setzen/zu löschen.
        """

        def on_message(client, userdata, msg):
            try:
                payload = json.loads(msg.payload.decode("utf-8"))
            except json.JSONDecodeError:
                logging.warning(f"Invalid JSON on topic {msg.topic}")
                return

            if msg.topic == TOPIC_SESSION_START:
                # Erwartet: { "sessionId": 123, ... }
                session_id = payload.get("sessionId")
                if session_id is not None:
                    self.current_session_id = int(session_id)
                    logging.info(
                        f"[SESSION] Start session_id={self.current_session_id}"
                    )

                    # Timer-State für neue Session zurücksetzen
                    self.last_s1_ts.clear()
                    self.last_s2_ts.clear()
                    self.lap_counter.clear()

                    # CU-Start -> Startampel/Tower
                    self.start_cu_race()

            elif msg.topic == TOPIC_SESSION_STOP:
                logging.info(
                    f"[SESSION] Stop received for session_id={self.current_session_id}"
                )
                self.current_session_id = None
                # Du könntest hier zusätzlich die CU stoppen/resetten,
                # je nachdem was carreralib anbietet:
                # self.cu.stop() oder self.cu.reset()

        # WICHTIG: on_message nur hier setzen
        self.mqtt.on_message = on_message

        # Control-Topics abonnieren
        self.mqtt.subscribe(TOPIC_SESSION_START)
        self.mqtt.subscribe(TOPIC_SESSION_STOP)

        logging.info(
            f"Subscribed to control topics: {TOPIC_SESSION_START}, {TOPIC_SESSION_STOP}"
        )

    # ---------------------------------------------------------------------

    def connect_cu(self):
        logging.info(f"Connecting to CU at {self.device} ...")
        self.cu = ControlUnit(self.device)
        version = self.cu.version()
        logging.info(f"Connected to CU, version={version}")
        self.cu.reset()
        logging.info("CU timer reset")

    # ---------------------------------------------------------------------

    def publish(self, topic: str, payload: dict, qos: int = 1, retain: bool = False):
        data = json.dumps(payload, separators=(",", ":"))
        result = self.mqtt.publish(topic, data, qos=qos, retain=retain)
        logging.info(f"resultMQTT: {result}")
        if result.rc != mqtt.MQTT_ERR_SUCCESS:
            logging.warning(f"MQTT publish failed topic={topic} rc={result.rc}")

    # ---------------------------------------------------------------------

    def handle_timer_event(self, t: ControlUnit.Timer):
        """
        t.address:  0..7 (Controller-Adresse)
        t.timestamp: CU-Zeit in ms
        t.sector:   1 = Start/Ziel, 2 = Check-Lane (Annahme: 2 Sektoren)
        """
        addr = t.address
        # IGNORE Pace Car (7) & Ghost Car (6)
        if addr >= 6:
            return

        sector = t.sector
        cu_ts = t.timestamp
        wall_ts = int(time.time() * 1000)

        # Init-State für diese Adresse
        if addr not in self.last_s1_ts:
            self.last_s1_ts[addr] = None
            self.last_s2_ts[addr] = None
            self.lap_counter[addr] = 0

        # --------------------- Sector 2: Mitte der Runde -------------------
        if sector == 2:
            self.last_s2_ts[addr] = cu_ts
            logging.debug(f"addr={addr} hit S2 at {cu_ts}ms")
            return

        # --------------------- Sector 1: Start/Ziel ------------------------
        if sector == 1:
            prev_s1 = self.last_s1_ts[addr]
            prev_s2 = self.last_s2_ts[addr]

            logging.info(f"s1={prev_s1}, s2={prev_s2}"),

            # Für die allererste Überfahrt über Start/Ziel haben wir keine Runde
            if prev_s1 is not None and prev_s2 is not None and prev_s2 > prev_s1:
                s1_time = prev_s2 - prev_s1
                s2_time = cu_ts - prev_s2
                lap_time = cu_ts - prev_s1

                self.lap_counter[addr] += 1
                lap_nr = self.lap_counter[addr]

                logging.info("in publish of code")

                payload = {
                    "eventType": "lap",
                    "sessionId": self.current_session_id,
                    "controllerAddress": addr,
                    "lapNumber": lap_nr,
                    "lapTimeMs": lap_time,
                    "sectorTimes": {
                        "s1": s1_time,
                        "s2": s2_time,
                    },
                    "cuTimestampMs": cu_ts,
                    "wallClockTs": wall_ts,
                }
                
                logging.info(f"published: {payload}")

                # Wenn du willst, dass NUR mit aktiver Session publisht wird:
                # if self.current_session_id is not None:
                #     self.publish(TOPIC_LAP, payload)
                logging.info(f"session_id: {self.current_session_id}")

                self.publish(TOPIC_LAP, payload)

                logging.info(
                    f"LAP addr={addr} lap={lap_nr} "
                    f"lapTime={lap_time}ms s1={s1_time}ms s2={s2_time}ms "
                    f"sessionId={self.current_session_id}"
                )

            # Aktuelles Start/Ziel als neuer Referenzpunkt merken
            self.last_s1_ts[addr] = cu_ts
            return

        # Falls irgendwann Sector 3 o.ä. auftaucht, ignorieren wir ihn vorerst:
        logging.debug(f"Ignoring sector {sector} for addr={addr}")

    # ---------------------------------------------------------------------
    def run(self):
        if self.cu is None:
            self.connect_cu()

        logging.info("Starting CU → MQTT Lap bridge loop")
        try:
            while True:
                try:
                    msg = self.cu.poll()
                except CuTimeoutError as e:
                    logging.error(f"CU poll timeout (BLE): {e} – trying to reconnect")
                    # Bestehende CU-Verbindung sauber schließen
                    try:
                        if self.cu is not None:
                            self.cu.close()
                    except Exception as close_err:
                        logging.warning(f"Error while closing CU after timeout: {close_err}")
                    # Neu verbinden versuchen
                    self.cu = None
                    time.sleep(1.0)
                    try:
                        self.connect_cu()
                        logging.info("Reconnected to CU after timeout")
                    except Exception as reconnect_err:
                        logging.error(f"Reconnecting to CU failed: {reconnect_err}")
                        # Wenn Reconnect scheitert, kurze Pause und nächste Poll-Runde
                        time.sleep(2.0)
                    continue

                if msg is None:
                    # Nichts Neues, kurz schlafen (optional)
                    time.sleep(0.01)
                    continue

                # 🧠 Debug: Zeig mir ALLES, was kommt
                if hasattr(msg, "address") and hasattr(msg, "sector") and hasattr(msg, "timestamp"):
                    logging.info("CU RAW: %r (%s)", msg, type(msg))
                    logging.info(isinstance(msg, ControlUnit.Timer))


                # Wenn es ein Timer ist → handle_timer_event
                if isinstance(msg, ControlUnit.Timer):
                    logging.info("timer")
                    self.handle_timer_event(msg)
        except KeyboardInterrupt:
            logging.info("KeyboardInterrupt - shutting down bridge ...")
        finally:
            if self.cu is not None:
                self.cu.close()
            self.mqtt.loop_stop()
            self.mqtt.disconnect()
            logging.info("Bridge stopped cleanly.")


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


def main():
    mqtt_client = create_mqtt_client()
    bridge = CarreraMqttBridge(device=CU_DEVICE, mqtt_client=mqtt_client)
    bridge.run()


if __name__ == "__main__":
    main()
