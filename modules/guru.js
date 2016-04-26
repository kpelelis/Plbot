var Base = require("./base");
var Command = require("../command");

const responses = [
  "Δεν το κόβω",
  "Μπααα",
  "Ισως",
  "Είμαι αρκετά σίγουρος πως ναι",
  "Καλά περίμενε εσύ...",
  "100%",
  "Στανταράκι",
  "Ναι ημίχρονο, οχι τελικό"
];

var answer = new Command({
  name: "guru",
  level: 2,
  action: (bot, user, to, args) => {
    bot.say(responses[Math.floor(Math.random() * responses.length)], to);
  }
});

class Guru extends Base {
  constructor(options) {
    super();
    this.commands = {
      guru: answer
    };
    this.name = "guru";
    this.description = "Ask Halley";
    this.option = options.key;
  }
}

module.exports = Guru;
