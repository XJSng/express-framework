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

exports.up = function(db) {
  return db.addForeignKey('products', 'categories', 'product_category_fk',
  {
    "category_id": "id"
  },
  {
    onDelete: "CASCADE", // When category is deleted, all products associated with it are deleted
    onUpdate: "RESTRICT" // When update is done to primary key, MySQL will prevent you from doing so
  });
};

exports.down = function(db) {
  return db.removeForeignKey("products", "product_category_fk");
};

exports._meta = {
  "version": 1
};
