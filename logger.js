var winston = require("winston");
var path = require("path");
var PROJECT_ROOT = __dirname;

const defaultConfig = {
  levels: {
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    info: "green",
    warn: "yellow",
    error: "red"
  },
  file: "./logs/main.log"
};

exports.initLogger = cfg => {
  const config = cfg || defaultConfig;
  const { levels, colors, file } = config;
  return new Promise((resolve, reject) => {
    let logger = new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: "info",
          timestamp: function() {
            return Date.now();
          },
          formatter: function(options) {
            return `[${options.timestamp()}] [${options.level.toUpperCase()}] ${
              options.message
            }`;
          }
        })
      ]
    });
    resolve(logger);
  });
};
