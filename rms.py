import os
import time
import json
import logging
from typing import Dict, Optional

import paho.mqtt.client as mqtt
from carreralib import ControlUnit  # WICHTIG: nur ControlUnit importieren

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# ---------------------------------------------------------------------------
# ENV / CONFIG
# ---------------------------------------------------------------------------

CU_DEVICE = os.getenv("CU_DEVICE", "D2:B9:57:15:EE:AC")

MQTT_HOST = os.getenv("MQTT_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "mqtt_user")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "mqtt_pass")

# Nur Lap-Events – genau EIN Topic mit Runde + Sektorzeiten
TOPIC_LAP = os.getenv("MQTT_TOPIC_LAP_TIMES", "carrera/cu/lapTimes")

# Optional: Raw Timer Events (für Debugging); kannst du auch einfach ignorieren
TOPIC_RAW = os.getenv("MQTT_TOPIC_TIMER_RAW", "carrera/cu/timerRaw")


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
# CU → MQTT Bridge (nur Lap-Events mit Sektorzeiten)
# ---------------------------------------------------------------------------


class CarreraMqttBridge:
    """
    Liest Timer-Events aus der Carrera Control Unit
    und publisht NUR nach jeder vollständigen Runde ein Lap-Event
    mit LapTime + Sektor1 + Sektor2.
    """

    def __init__(self, device: str, mqtt_client: mqtt.Client):
        self.device = device
        self.mqtt = mqtt_client
        self.cu: Optional[ControlUnit] = None

        # Pro Controller-Adresse:
        self.last_s1_ts: Dict[int, Optional[int]] = {}
        self.last_s2_ts: Dict[int, Optional[int]] = {}
        self.lap_counter: Dict[int, int] = {}

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

        # IGNORE Pace Car (6) & Ghost Car (7)
        if addr >= 6:
            return

        sector = t.sector
        cu_ts = t.timestamp
        wall_ts = int(time.time() * 1000)

        # Optional: Raw Event publishen (Debug/Logging)
        self.publish(
            TOPIC_RAW,
            {
                "controllerAddress": addr,
                "sector": sector,
                "cuTimestampMs": cu_ts,
                "wallClockTs": wall_ts,
            },
        )

        # Init-State für diese Adresse
        if addr not in self.last_s1_ts:
            self.last_s1_ts[addr] = None
            self.last_s2_ts[addr] = None
            self.lap_counter[addr] = 0

        # --------------------- Sector 2: Mitte der Runde -------------------
        if sector == 2:
            # einfach nur merken, wann der Fahrer durch Sektor 2 ist
            self.last_s2_ts[addr] = cu_ts
            logging.debug(f"addr={addr} hit S2 at {cu_ts}ms")
            return

        # --------------------- Sector 1: Start/Ziel ------------------------
        if sector == 1:
            prev_s1 = self.last_s1_ts[addr]
            prev_s2 = self.last_s2_ts[addr]

            # Für die allererste Überfahrt über Start/Ziel haben wir keine Runde
            if prev_s1 is not None and prev_s2 is not None and prev_s2 > prev_s1:
                # Runde ist komplett: S1(prev) -> S2(prev) -> S1(aktuell)
                s1_time = prev_s2 - prev_s1
                s2_time = cu_ts - prev_s2
                lap_time = cu_ts - prev_s1

                self.lap_counter[addr] += 1
                lap_nr = self.lap_counter[addr]

                payload = {
                    "eventType": "lap",
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

                self.publish(TOPIC_LAP, payload)
                logging.info(
                    f"LAP addr={addr} lap={lap_nr} "
                    f"lapTime={lap_time}ms s1={s1_time}ms s2={s2_time}ms"
                )

            # Aktuelles Start/Ziel immer als neuer Referenzpunkt merken
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
                msg = self.cu.poll()
                # msg ist entweder ControlUnit.Status oder ControlUnit.Timer
                if isinstance(msg, ControlUnit.Timer):
                    self.handle_timer_event(msg)
                # Status interessiert uns hier nicht – könnte man später nach MQTT schieben.
        except KeyboardInterrupt:
            logging.info("KeyboardInterrupt – shutting down bridge ...")
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
