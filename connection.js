const {
  slack,
  RtmClient,
  WebClient,
  CLIENT_EVENTS,
  RTM_EVENTS
} = require("@slack/client");

const token = "";

class Connection {
  constructor(server, evtManager) {
    this.client = null;
    this.server = server;

    this.evtManager = evtManager;
    this.users = {};
    this.channels = {};
    this.ims = {};
  }

  installEventHandlers() {
    this.client.on(RTM_EVENTS.MESSAGE, message => {
      const formatedMessage = {
        from: message.user,
        to: message.channel,
        message: message.text
      };
      this.evtManager.fire("connection.message", formatedMessage);
    });

    this.client.on(RTM_EVENTS.MESSAGE.IM, message => {
      const formatedMessage = {
        from: message.user,
        to: message.channel,
        message: message.text
      };
      this.evtManager.fire("connection.message", formatedMessage);
    });

    this.client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, connectedData => {
      console.log("[BOT] [Slack] Client Authenticated");
      let channelPromise = this.webClient.channels.list();
      let usersPromise = this.webClient.users.list();
      let imsPromise = this.webClient.im.list();

      Promise.all([channelPromise, usersPromise, imsPromise]).then(values => {
        let channels = values[0].channels;
        for (let i = 0; i < channels.length; i++) {
          this.channels[channels[i].id] = channels[i];
        }

        let users = values[1].members;
        for (let i = 0; i < users.length; i++) {
          const lastUpdate = new Date(users[i].updated * 1000);
          if (Math.abs(Date.now() - lastUpdate) / (1000 * 3600 * 24 * 30) > 5) {
            console.log(`User ${users[i].name} is innactive`);
          } else {
            this.users[users[i].id] = users[i];
          }
        }

        let ims = values[2].ims;
        for (let i = 0; i < ims.length; i++) {
          let im = ims[i];
          if (im.is_im && !im.is_user_deleted) {
            this.ims[im.user] = im;
          }
        }
        this.evtManager.fire("connection.ready", {
          users: this.users,
          channels: this.channels
        });
      });
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      process.stdout.write(` Connecting to Slack ... `);
      this.client = new RtmClient(token, {
        dataStore: false,
        useRtmConnect: true
      });
      this.webClient = new WebClient(token);
      this.installEventHandlers();
      process.stdout.write(`OK\n`);
      this.client.start();
      resolve(this);
    });
  }

  close() {
    this.client = null;
    this.webClient = null;
  }

  whisper(message, to) {
    if (!this.ims[to]) {
      this.webClient.im.open(this.users[to].id).then(im => {
        this.ims[im.user] = im;
        return this.client
          .sendMessage(message, im.channel.id)
          .catch(e => console.error(e));
      });
    } else {
      return this.client.sendMessage(message, this.ims[to].id);
    }
  }

  broadcast(message, channel) {
    return this.client.sendMessage(message, channel);
  }

  banUser(user) {}
}

module.exports = Connection;
