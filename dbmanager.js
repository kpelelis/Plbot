const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const mongoose = require("mongoose");
const { unloadNodeModule } = require("./util");

class DBManager {
  constructor(uri) {
    this.uri = uri || process.env.DB_URI;
    this.connection = mongoose.createConnection(this.uri);
    this.models = {};
    this.schemaDir = "./models";
  }

  loadSchemas() {
    process.stdout.write(` Loading database schemas\n`);
    return new Promise((resolve, reject) => {
      fs.readdir(this.schemaDir, (err, files) => {
        if (err) {
          throw new Error(err);
        }
        files.forEach((file, index) => {
          let schema = require(this.schemaDir + path.sep + file);
          process.stdout.write(`  Loading model ${schema.name} ... `);
          this.models[file] = this.connection.model(file, schema.schema);
          process.stdout.write(`OK\n`);
          if (index == files.length - 1) {
            resolve(this.models);
          }
        });
      });
    });
  }

  query(table, params) {
    return new Promise((resolve, reject) => {
      let model = this.models[table];
      if (!model) {
        throw new Error("Model undefined");
      }
      model
        .find(params || {})
        .then(items => resolve(items))
        .catch(ex => reject(ex));
    });
  }

  insert(table, params) {
    return new Promise((resolve, reject) => {
      let model = this.models[table];
      if (!model) {
        reject("Model undefined");
      }
      model(params || {})
        .save()
        .then(v => resolve(v), e => reject(e));
    });
  }

  update(table, query, params) {
    return new Promise((resolve, reject) => {
      let model = this.models[table];
      if (!model) {
        reject("Model undefined");
      }
      model.update(query, params || {}).then(v => resolve(v), e => reject(e));
    });
  }

  close() {
    this.connection.close();
    process.stdout.write(` Cleaning database schemas\n`);
    Object.keys(this.models).forEach(model => {
      process.stdout.write(`  ${model} ...`);
      unloadNodeModule(this.schemaDir + path.sep + model);
      process.stdout.write(`OK`);
    });
  }
}

module.exports = DBManager;
