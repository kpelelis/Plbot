var Base = require("./base");

var urlRegX = /\(?(?:(http|https):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/;

var matcher = new RegExp(urlRegX);

class LinkChecker extends Base {
  constructor(options) {
    super();
    this.name = "linkchecker";
    this.description = "Check if a link is posted";
    this.events = {
      "bot.chat.message": ({ bot, from, to, message }) => {
        if (message.match(matcher)) bot.say("No links allowed " + from, to);
      }
    };
  }
}

module.exports = LinkChecker;
