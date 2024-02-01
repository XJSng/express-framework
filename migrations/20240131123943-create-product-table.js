'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// the "up" function is called when you want to add new change to a database
exports.up = function (db) {
  // 1st parameter - name of the table
  // 2nd parameter - an object that has all the columns
  // each key will be the name of the column
  // 
  return db.createTable("products", {
    "id": {
      type: "int", primaryKey: true, autoIncrement: true
      , "unsigned": true
    }, name: { type: "string", length: 100, notNull: true },
    cost: { type: "int", unsigned: true, notNull: true },
    description: "text"
  });
};

/*
CREATE TABLE products (
  id INT unsigned AUTO_INCREMENT PRIMARY KEY
  name VARCHAR(100) NOT NULL,
  cost INT UNSIGNED NOT NULL,
  description TEXT
) engine = innodb
*/

// the "down" function is called when you want to undo the change to a database
exports.down = function (db) {
  return db.dropTable("products");
};

exports._meta = {
  "version": 1
};
