"use strict";

exports.up = async function (knex) {
  const has = await knex.schema.hasColumn("product_prices", "preco_de");
  if (!has) {
    await knex.schema.alterTable("product_prices", (t) => {
      t.decimal("preco_de", 12, 2).nullable();
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasColumn("product_prices", "preco_de");
  if (has) {
    await knex.schema.alterTable("product_prices", (t) => {
      t.dropColumn("preco_de");
    });
  }
};
