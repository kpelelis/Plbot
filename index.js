const { unloadNodeModule } = require("./util");
const { initLogger } = require("./logger");

let config;
let bot;

function startBot(logger) {
  const logMiddleWare = (from, to, args) => {
    console.log(from, to, args);
    return next => {
      logger.log(`[${to}][${from}] ${message}`);
      next(from, to, args);
    };
  };
  const Bot = require("./bot");
  try {
    config = require("./config");
  } catch (ex) {
    console.log("Error while loading configuration file: ");
    console.log(ex);
    process.exit();
  }
  bot = new Bot(config.bot, config.modules, logger, [logMiddleWare]);
  bot.start().catch(er => console.log(er));

  bot.EventManager.on("bot.reboot.shutdown.end", () => {
    bot = null;
    unloadNodeModule("./bot");
    unloadNodeModule("./config");
    startBot();
  });
}

initLogger().then(l => startBot(l));
