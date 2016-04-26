var logger = require("./logger");

var actionFactory = {
  createAction: args => {
    return new Promise((resolve, reject) => {
      switch (args.type) {
        case "say":
          resolve(new SayAction(args.message));
          break;
        case "whisper":
          resolve(new WhisperAction(args.message));
          break;
        case "func":
          resolve(new FuncAction(args.funcName));
          break;
        default:
          throw new Error("Unknow action type");
      }
    });
  }
};

module.exports.actionFactory = actionFactory;

class Action {
  constructor(type, exe) {
    this.type = type;
    this.execute = exe;
  }
}

class SayAction extends Action {
  constructor(message) {
    super("say", (bot, from, to, args) => {
      bot.say(message, to);
    });
  }
}

class WhisperAction extends Action {
  constructor(message) {
    super("whisper", (bot, from, to, args) => {
      bot.whisper(message, from);
    });
  }
}

class FuncAction extends Action {
  constructor(funcName) {
    super("func", funcWrapper[funcName]);
  }
}

/* Move this to a different file */
var funcWrapper = {
  commands: (bot, from, to, args) => {
    var commands = bot.CommandManager.commands;
    var res = Object.keys(commands).join(", ");
    bot.say(res, to);
  },
  users: (bot, from, to, args) => {
    var { channels, users } = bot;
    bot.say(channels.join(", ") + " users:" + users.join(", "), to);
  },
  "add-command": (bot, from, to, args) => {
    bot.CommandManager.addCommand(args)
      .then(cmd => bot.whisper("Command {0} added ".format(cmd.name), from))
      .catch(({ message, cmd }) =>
        bot.whisper(message, from).catch(e => console.error(e))
      );
  },
  "remove-command": (bot, from, to, args) => {
    bot.CommandManager.removeCommand(args[0]).then(res =>
      bot.whisper("Command {0} removed".format(args[0]), from)
    );
  },
  reboot: (bot, from, to, args) => {
    bot.say("Rebooting...", to);
    bot.restart();
  },
  quit: (bot, from, to, args) => {
    bot.say("Exiting...", to);
    bot.stop();
  }
};
