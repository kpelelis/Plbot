const Base = require("./base");
const CronJob = require("cron").CronJob;
const Command = require("../command");

class Cleaning extends Base {
  constructor(config, bot) {
    super();
    this.name = "Cleaning Module";
    const { cleaners } = config;
    this.bot = bot;
    this.cleaningIndex = 0;
    this.botReady = false;
    this.bot.EventManager.on("connection.ready", () => {
      this.botReady = true;
      this.cleaningCron = new CronJob(
        "00 00 12 * * 1,4",
        this.notifyCleaners,
        () => {},
        false,
        "Europe/Athens"
      );
    });
    this.commands = {
      fasina: new Command({
        name: "blackjack",
        level: 5,
        action: this.showCleaners.bind(this)
      })
    };
    this.cleaners = cleaners;
  }

  showCleaners(bot, from, to, args) {
    const cleanerA = this.cleaners[this.cleaningIndex];
    const cleanerB = this.cleaners[
      (this.cleaningIndex + 1) % this.cleaners.length
    ];
    bot.say(
      `Οι υπέυθυνοι καθαριότητας αυτή την εβδομάδα είναι:\n@${cleanerA} @${cleanerB}`,
      to
    );
  }

  notifyCleaners() {
    for (let i = 0; i < 2; i++) {
      const user = this.cleaners[this.cleaningIndex % this.cleaners.length];
      const cleaningMessage = `
      Γεια σου ${user}. Είναι η σειρά σου να καθαρίσεις το γραφείο. \n
      Οι αρμοδιότητες σου είναι οι εξής:\n
      1) Σκουπισμα\n
      2) Σφουγγάρισμα\n
      3) Πιάτα\n
      `;
      this.bot.whisper(cleaningMessage, user);
      this.cleaningIndex = (this.cleaningIndex + 1) % this.cleaners.length;
    }
  }
}

module.exports = Cleaning;
