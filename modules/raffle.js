var Base = require("./base");
var Command = require("../command");

class Raffle extends Base {
  constructor({ interval, maxUsers }) {
    super();
    this.name = "raffle";
    this.description = "A funny raffle game";
    this.interval = interval > 0 ? interval : 1;
    this.maxUsers = maxUsers;
    this.joinedUsers = [];
    this.activeRaffle = false;
    this.commands = {
      raffle: new Command({
        name: "raffle",
        level: 2,
        action: (bot, from, to, args) => {
          if (args.length < 2) {
            bot.say("Not enough arguments", to);
            return;
          }
          var duration = parseInt(args[0]);
          var reward = args.slice(1).join(" ");

          if (isNaN(duration)) {
            bot.say(
              `"${arg[1]}" is not a valid duration time! Use a valid integer.`,
              to
            );
            return;
          }
          this.startRaffle(bot, to, duration, reward);
        }
      }),
      join: new Command({
        name: "join",
        level: 2,
        action: (bot, from, to, args) => {
          if (
            this.joinedUsers.indexOf(from) == -1 &&
            this.joinedUsers.length < this.maxUsers
          ) {
            this.joinedUsers.push(from);
          }
        }
      })
    };
  }

  startRaffle(bot, to, duration, reward) {
    if (this.activeRaffle) {
      bot.say("Can not start a new raffle while there is an ongoing one!", to);
    } else {
      bot.say(
        `A new raffle has begun. The reward is ${reward}. Type !join to join. The raffle ends in ${duration} seconds`,
        to
      );
      this.activeRaffle = true;
      this.joinedUsers = [];
      var timer = duration;
      var tick = timer * this.interval;
      setTimeout(() => {
        this.notify(bot, to, tick, timer, reward);
      }, tick * 1000);
    }
  }

  notify(bot, to, tick, timer, reward) {
    timer -= tick;
    if (timer <= 0) {
      this.endRaffle(bot, to, reward);
    } else {
      bot.say(`The raffle ends in ${timer} seconds. Type !join to join`, to);
      setTimeout(() => {
        this.notify(bot, to, tick, timer, reward);
      }, tick * 1000);
    }
  }

  endRaffle(bot, to, reward) {
    if (this.joinedUsers === []) {
      bot.say("The raffle has ended but nobody joined");
    } else {
      var winner = this.joinedUsers[
        Math.floor(Math.random() * this.joinedUsers.length)
      ];
      bot.say(`The raffle has ended. ${winner}  is the winner`, to);
      this.activeRaffle = false;
    }
  }
}

module.exports = Raffle;
