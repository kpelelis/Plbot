var EventEmitter 	= require('events').EventEmitter;

class EventManager extends EventEmitter {
    constructor() {
        super();
    }

    fire(event, args) {
        this.emit(event, args);
    }

}

module.exports = EventManager;

