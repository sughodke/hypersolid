
export class Emittable {
    eventCallbacks: {
        [eventName: string] : ((self: Object) => any)[]
    } = {};

    on(eventName: string, callback: (self: Object) => any) {
        if (!(eventName in this.eventCallbacks)) {
            this.eventCallbacks[eventName] = [];
        }

        this.eventCallbacks[eventName].push(callback);
    }

    triggerEventCallbacks(eventName: string) {
        if (eventName in this.eventCallbacks) {
            this.eventCallbacks[eventName].map(callback => callback.call(self));
        }
    }
}
