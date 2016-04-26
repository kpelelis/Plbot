const { unloadNodeModule } = require("../util");

class ModuleManager {
  constructor(bot) {
    this.modules = {};
    this.bot = bot;
  }

  registerModule(moduleName, module) {
    return new Promise((resolve, reject) => {
      process.stdout.write("  Registering module {0} ... ".format(module.name));
      if (this.modules[module.name]) reject("  Module already registered");

      let events = module.events;
      for (var ev in events) {
        this.bot.EventManager.on(ev, events[ev]);
      }

      this.bot.CommandManager.loadModuleCommands(module.commands);
      this.modules[moduleName] = module;
      process.stdout.write("   OK\n");
    });
  }

  unregisterModule(moduleName) {
    return new Promise((resolve, reject) => {
      console.log("  Unregistering Module " + moduleName);
      let module = this.modules[moduleName];
      if (!module) reject("Module not registered");

      let events = module.events;
      for (var ev in events) {
        this.bot.EventManager.removeListener(ev, events[ev]);
      }

      //Remove commands
      let commands = module.commands;
      for (var cmd in commands) {
        this.bot.CommandManager.removeCommand(cmd);
      }

      unloadNodeModule[moduleName];
      resolve();
    });
  }

  unregisterAll() {
    return Promise.all(
      Object.keys(this.modules).map(this.unregisterModule.bind(this))
    );
  }

  registerBulk(bot, modules) {
    process.stdout.write(` Registering modules\n`);
    return Promise.all(
      Object.keys(modules)
        .filter(module => {
          return modules[module].enabled;
        })
        .map(module => {
          let _module = require("./" + module);
          var moduleOptions = modules[module].options || {};
          return this.registerModule(module, new _module(moduleOptions, bot));
        })
    );
  }
}

module.exports = ModuleManager;
