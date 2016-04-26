var Base = require("./base");
var Command = require("../command");

var ranks = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  Βαλές: 10,
  Ντάμα: 10,
  Ρήγας: 10,
  Άσσος: 11
};
var suites = ["Κούπα", "Καρό", "Μπαστούνι", "Σπαθί"];

class Blackjack extends Base {
  constructor(options) {
    super();
    this.name = "blackjack";
    this.active_games = {};
    this.description = "Classic Blackjack game";
    this.commands = {
      blackjack: new Command({
        name: "blackjack",
        level: 5,
        action: (bot, from, to, args) => {
          var userGame = this.active_games[from];
          var bet = args[0] || 0;
          if (!userGame || userGame.state == "IDLE") {
            this.startNewGame(bot, from, bet);
          } else {
            bot.whisper("Υπάρχει ήδη ένα ενεργό παιχνίδι blackjack", from);
          }
        }
      }),
      hitme: new Command({
        name: "blackjack",
        level: 2,
        action: (bot, from, to, args) => {
          var userGame = this.active_games[from];
          if (!userGame || userGame.state == "IDLE") {
            bot.whisper(
              "Δεν γίνεται να μοιράσω χαρτιά αν δεν έχεις ξεκινήσει παιχνίδι. Γράψε !blackjack για να ξεκινήσεις",
              from
            );
          } else {
            let card = this.dealCard(userGame);
            userGame.sum += card.value;
            bot.whisper(
              "{0} {1}. Αθροισμα = {2} (Για να συνεχίσεις γράψε !hitme αλλιώς για να σταματήσεις γράψε !stop)".format(
                card.rank,
                card.suite,
                userGame.sum
              ),
              from
            );
            if (userGame.sum > 21) userGame.state = "LOST";
            else if (userGame.sum == 21) userGame.state = "WON";
            this.processGameState(bot, userGame);
          }
        }
      }),
      stop: new Command({
        name: "blackjack",
        level: 2,
        action: (bot, from, to, args) => {
          var userGame = this.active_games[from];
          if (!userGame || userGame.state == "IDLE") {
            bot.whisper(
              "Δεν γίνεται να μοιράσω χαρτιά αν δεν έχεις ξεκινήσει παιχνίδι. Γράψε !blackjack για να ξεκινήσεις",
              from
            );
          } else {
            bot.whisper("Σειρά μου!", from);
            let aiScore = this.AIDeal(userGame);
            bot.whisper(
              "Μου ρθε {0}, {1}".format(aiScore.sum, aiScore.cardsStr),
              from
            );
            if (aiScore.sum > 21 || aiScore.sum < userGame.sum)
              userGame.state = "WON";
            else if (aiScore.sum == userGame.sum) userGame.state = "TIE";
            else userGame.state = "LOST";
            this.processGameState(bot, userGame);
          }
        }
      })
    };
  }

  createDeck() {
    var deck = [];
    for (var idx in suites) {
      for (var rank in ranks) {
        deck.push({
          rank: rank,
          suite: suites[idx],
          value: ranks[rank]
        });
      }
    }
    return deck.sort(() => 0.5 - Math.random());
  }

  startNewGame(bot, user, bet) {
    this.active_games[user] = {
      user: user,
      state: "ACTIVE",
      deck: this.createDeck(),
      bet: bet,
      sum: 0
    };
    bot.whisper(
      `Ξεκίνησες ενα νέο παιχνίδι blackjack! Πόνταρες ${bet} λεφτά`,
      user
    );
    let game = this.active_games[user];
    let card = this.dealCard(game);
    game.sum += card.value;
    bot.whisper(
      "{0} {1}. Άθροισμα = {2} (Για να συνεχίσεις γράψε !hitme αλλιώς για να σταματήσεις γράψε !stop)".format(
        card.rank,
        card.suite,
        game.sum
      ),
      user
    );
  }

  dealCard(game) {
    var card = game.deck[0];
    game.deck = game.deck.slice(1);
    return card;
  }

  AIDeal(game) {
    let sum = 0;
    let cards = [];
    while (sum <= game.sum) {
      let card = this.dealCard(game);
      cards.push(card);
      sum += card.value;
    }
    var cardsStr = cards
      .map(card => "{0} {1}".format(card.rank, card.suite))
      .join(", ");
    return { sum: sum, cardsStr: cardsStr };
  }

  processGameState(bot, game) {
    switch (game.state) {
      case "WON":
        bot.whisper(
          "Μπράβο! Κέρδισες και διπλασίασες τα λεφτά σου ({0} λεφτά)".format(
            game.bet * 2
          ),
          game.user
        );
        game.state = "IDLE";
        break;
      case "LOST":
        bot.whisper("Ωχ αδερφέ!", game.user);
        game.state = "IDLE";
        break;
      case "TIE":
        bot.whisper("Ισοπαλία... Πάιρνεις τα λεφτά σου πίσω", game.user);
        game.state = "IDLE";
        break;
    }
  }
}

module.exports = Blackjack;
