import { EventEmitter } from "node:events";

const bus = new EventEmitter();
bus.setMaxListeners(100);

export function publishEvent(type, data) {
  bus.emit("message", { type, data, timestamp: new Date().toISOString() });
}

export function subscribe(listener) {
  bus.on("message", listener);
  return () => bus.off("message", listener);
}
