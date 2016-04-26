var Base = require("./base");
var Command = require("../command");

var pong = new Command({
  name: "ping",
  level: 2,
  action: (bot, user, from, args) => {
    bot.say("pongo", from);
  }
});

class Ping extends Base {
  constructor(options) {
    super();
    this.commands = {
      ping: pong
    };
    this.name = "ping";
    this.description = "A really basic module";
    this.option = options.key;
  }
}

module.exports = Ping;
