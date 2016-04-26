var actionFactory = require("./action").actionFactory;

class Command {
  constructor(options) {
    this.name = options.name;
    this.level = options.level;
    this.cooldown = options.cooldown || 10;
    this.action = options.action;
    if (!this.action) {
      actionFactory
        .createAction(options.data)
        .then(action => {
          this.action = action;
        })
        .catch(e => console.log(e));
    }
  }

  run(bot, from, to, args) {
    return new Promise((resolve, reject) => {
      if (!this.action) reject();
      if (typeof this.action === "function") {
        this.action(bot, from, to, args);
      } else if (this.action) {
        this.action.execute(bot, from, to, args);
      }
      resolve();
    });
  }
}

module.exports = Command;
