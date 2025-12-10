import { MqttService } from './mqtt.service';
import * as mqtt from 'mqtt';

jest.mock('mqtt');

describe('MqttService', () => {
  let service: MqttService;
  const handlers: Record<string, (...args: any[]) => void> = {};
  const mockClient = {
    on: jest.fn((event: string, cb: any) => {
      handlers[event] = cb;
    }),
    publish: jest.fn(),
    subscribe: jest.fn(),
    end: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockClient.on.mockReset();
    mockClient.publish.mockReset();
    mockClient.subscribe.mockReset();
    mockClient.end.mockReset();
    mockClient.on.mockImplementation((event: string, cb: any) => {
      handlers[event] = cb;
    });
    mockClient.subscribe.mockImplementation(() => undefined);
    mockClient.publish.mockImplementation(() => undefined);
    mockClient.end.mockImplementation(() => undefined);
    Object.keys(handlers).forEach((k) => delete handlers[k]);
    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);
    service = new MqttService();
  });

  it('connects and wires message handling with lapEvents stream', async () => {
    service.onModuleInit();
    expect(mqtt.connect).toHaveBeenCalled();

    const lapEvents: any[] = [];
    service.lapEvents$().subscribe((ev) => lapEvents.push(ev));
    const payload = { controllerAddress: 1 };
    handlers['message']?.('carrera/cu/lapTimes', Buffer.from(JSON.stringify(payload)));

    expect(lapEvents).toEqual([payload]);
  });

  it('ignores invalid JSON messages', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    service.onModuleInit();

    handlers['message']?.('topic', Buffer.from('not-json'));

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('dispatches topic handlers registered via subscribe', () => {
    service.onModuleInit();
    const handler = jest.fn();
    service.subscribe('custom/topic', handler);

    handlers['message']?.('custom/topic', Buffer.from(JSON.stringify({ a: 1 })));

    expect(mockClient.subscribe).toHaveBeenCalledWith('custom/topic', { qos: 1 });
    expect(handler).toHaveBeenCalledWith({ a: 1 });
  });

  it('publishes JSON payloads and closes client on destroy', () => {
    service.onModuleInit();

    service.publish('foo', { a: 1 });
    expect(mockClient.publish).toHaveBeenCalledWith('foo', JSON.stringify({ a: 1 }), { qos: 1 });

    service.onModuleDestroy();
    expect(mockClient.end).toHaveBeenCalled();
  });
});
