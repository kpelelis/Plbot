const { unloadNodeModule } = require("./util");
var logger = require("./logger");

const _version = "0.0.1";

class Bot {
  constructor(config, modules) {
    const CommandManager = require("./commandManager");
    const Connection = require("./connection");
    const DBManager = require("./dbmanager");
    const EventManager = require("./eventManager");
    const ModuleManager = require("./modules/moduleManager");

    this.version = _version;
    this.name = config.name;
    this.server = config.server;
    this.modulesCfg = modules;

    this.users = {};
    this.channels = {};

    this.ModuleManager = new ModuleManager(this);
    this.CommandManager = new CommandManager(this);
    this.DBManager = new DBManager();
    this.EventManager = new EventManager();

    this.installEventHandlers();

    this._connection = new Connection(this.server, this.EventManager);
  }

  installEventHandlers() {
    this.EventManager.on("connection.ready", ({ channels, users }) => {
      this.channels = channels;
      this.addUsers(Object.keys(users))
        .then(users => {
          this.users = users;
        })
        .catch(e => console.error(e));
    });

    this.EventManager.on("connection.message", args => {
      this.parseMessage(args).catch(e => console.log(e));
    });
  }

  addUsers(activeUsers) {
    return new Promise((resolve, reject) => {
      resolve();
      this.DBManager.query("user", { id: { $in: activeUsers } }).then(users => {
        Promise.all(
          activeUsers.map(user =>
            this.DBManager.insert("user", {
              name: user,
              level: 1,
              banned: false
            }).catch(e => null)
          )
        ).then(added => {
          added = added.filter(v => v !== null);
          users = users.reduce((acc, user) => {
            acc[user.name] = user;
            return acc;
          }, {});
          added = added.reduce((acc, user) => {
            acc[user.name] = user;
            return acc;
          }, users);
          resolve(users);
        });
      });
    });
  }

  whisper(message, user) {
    return new Promise((resolve, reject) => {
      if (this._connection === null) {
        throw new Error("No active connection to send message");
      } else if (message.length >= 1 && message.length <= 500) {
        return this._connection.whisper(message, user);
      }
    });
  }

  say(message, channel) {
    console.log(`[BOT][self][${channel}] ${message}`);
    if (this._connection === null) {
      throw new Error("No active connection to send message");
    } else if (message.length >= 1 && message.length <= 500) {
      return this._connection
        .broadcast(message, channel || this.channels[0])
        .catch(e => console.error(e));
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      console.log(`Starting boot sequence`);
      let connection = this._connection
        .connect()
        .then(this.DBManager.loadSchemas.bind(this.DBManager))
        .then(
          this.CommandManager.loadDatabaseCommands.bind(this.CommandManager)
        )
        .then(
          this.ModuleManager.registerBulk.bind(this.ModuleManager)(
            this,
            this.modulesCfg
          )
        );
    });
  }

  stop() {
    this.EventManager.fire("bot.shutdown.start");

    process.stdout.write(` Closing connection ... `);
    this._connection.close();
    this._connection = null;
    process.stdout.write(`OK\n`);

    process.stdout.write(` Closing database connection\n`);
    this.DBManager.close();

    process.stdout.write(` Unregistering modules \n`);
    this.ModuleManager.unregisterAll().catch(e => console.log(e));
    process.stdout.write(`OK\n`);

    process.stdout.write(` Removing commands ... `);
    this.commandManager = null;
    process.stdout.write(`OK\n`);
    unloadNodeModule("./commandManager");
    unloadNodeModule("./connection");
    unloadNodeModule("./dbmanager");
    unloadNodeModule("./eventManager");
    unloadNodeModule("./modules/moduleManager");
    this.EventManager.fire("bot.shutdown.end");
  }

  restart() {
    this.EventManager.fire("bot.reboot.shutdown.start");
    process.stdout.write(`Started reboot process\n`);
    this.stop();
    this.EventManager.fire("bot.reboot.shutdown.end");
  }

  parseMessage(args) {
    return new Promise((resolve, reject) => {
      let { from, to, message } = args;
      if (message[0] == "!") {
        var tokens = message.substring(1).split(/\s+/);
        var command = {
          from,
          to,
          name: tokens[0],
          args: tokens.slice(1) || []
        };
        return this.CommandManager.parseCommand(command);
      } else {
        args.bot = this;
        var evt_type =
          from == this.name ? "bot.self.message" : "bot.chat.message";
        this.EventManager.fire(evt_type, args);
        resolve();
      }
    });
  }
}

module.exports = Bot;
