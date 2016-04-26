var logger = require("./logger");
var actionFactory = require("./action").actionFactory;
var ArgumentParser = require("argparse").ArgumentParser;
var ArgparseAction = require("argparse").Action;
var Command = require("./command");

var commandParser = new ArgumentParser({});
commandParser.addArgument(["--name"]);

class dataAction extends ArgparseAction {
  call(parser, namespace, values, optionString) {
    if (!namespace.data) namespace.data = {};
    if (this.dest == "message") values = values.join(" ");
    namespace.data[this.dest] = values;
  }
}

commandParser.addArgument(["-t", "--type"], { action: dataAction });
commandParser.addArgument(["--funcName"], { action: dataAction });
commandParser.addArgument(["--message"], {
  action: dataAction,
  nargs: "*"
});
commandParser.addArgument(["--args"], {
  nargs: "*",
  action: dataAction
});

class CommandManager {
  constructor(bot) {
    this.bot = bot;
    this.commands = {};
  }

  loadDatabaseCommands() {
    process.stdout.write(` Loading database commands\n   `);
    return new Promise((resolve, reject) => {
      this.bot.DBManager.query("command", { enabled: true })
        .then(results => {
          if (results.length < 1) resolve(this.commands);

          results.forEach((commandOpts, index) => {
            let newCommand = new Command(commandOpts);
            this.commands[commandOpts.name] = newCommand;
            process.stdout.write(`${commandOpts.name} `);
            if (index == results.length - 1) {
              resolve(this.commands);
              process.stdout.write(` ... OK\n`);
            }
          });
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  loadModuleCommands(modCommands) {
    return new Promise((resolve, reject) => {
      let names = Object.keys(modCommands);
      names.forEach((name, index) => {
        this.commands[name] = modCommands[name];
        if (index == names.length - 1) {
          resolve(this.commands);
        }
      });
    });
  }

  removeCommand(command) {
    return this.bot.DBManager.update(
      "command",
      { name: command },
      { $set: { enabled: false } }
    ).then(results => {
      delete this.commands[command];
    });
  }

  addCommand(command) {
    return new Promise((resolve, reject) => {
      var args = commandParser.parseArgs(command);
      if (
        args.name === null ||
        args.level === null ||
        args.data.type === null
      ) {
        reject({ message: "Invalid Arguments", cmd: command });
      } else if (this.commands[args.name]) {
        reject({ message: "Command Already exists", cmd: command });
      } else {
        this.bot.DBManager.insert("command", args).then(command => {
          this.commands[command.name] = new Command(command);
          resolve(command);
        });
      }
    });
  }

  parseCommand(commandOpts) {
    const { name, from, to, args } = commandOpts;

    if (!this.commands[name]) {
      return this.bot.say("Command {0} unknown".format(name), to);
    } else {
      return this.commands[name].run(this.bot, from, to, args);
    }
  }
}

module.exports = CommandManager;
