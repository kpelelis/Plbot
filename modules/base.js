/**
* This is a base class for the modules of the bot
* the modules have a unified of representation so
* that they need the minimum configuration to work
* every module will have specific command to execute
*
* @class BaseModule
* @constructor
*/

class BaseModule {

    constructor(name, enabled) {
	    this.commands = {};
        this.events = {};
	    this.name = name || '';
    }
}

module.exports = BaseModule;
