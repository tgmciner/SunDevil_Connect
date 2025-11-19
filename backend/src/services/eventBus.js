// Very small Observer/EventBus implementation
class EventBus {
  constructor() {
    this.observers = {}; // { eventType: [handler, ...] }
  }

  subscribe(eventType, handler) {
    if (!this.observers[eventType]) {
      this.observers[eventType] = [];
    }
    this.observers[eventType].push(handler);
  }

  async publish(eventType, payload) {
    const handlers = this.observers[eventType] || [];
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`Error in observer for ${eventType}:`, err);
      }
    }
  }
}

const eventBus = new EventBus();
module.exports = eventBus;
