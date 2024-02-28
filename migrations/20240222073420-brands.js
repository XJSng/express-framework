'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// Brand Tables a quite special as it serves as a placeholder in connecting foreign keys
// This is important because foreign keys cannot be null when they are created for existing tables.
exports.up = function(db) {
  return db.createTable("brands", {
    "id": {
      "type": "int",
      "primaryKey": true,
      "autoIncrement": true,
      "unsigned":true
    },
    "name": {
      "type": "string",
      "length": 100,
      "notNull":true
    }
  })
};

exports.down = function(db) {
  return db.dropTable("brands");
};

exports._meta = {
  "version": 1
};
