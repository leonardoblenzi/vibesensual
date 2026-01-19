"use strict";

exports.up = async function (knex) {
  const has = await knex.schema.hasColumn("products", "descricao_longa");
  if (!has) {
    await knex.schema.alterTable("products", (t) => {
      t.text("descricao_longa");
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasColumn("products", "descricao_longa");
  if (has) {
    await knex.schema.alterTable("products", (t) => {
      t.dropColumn("descricao_longa");
    });
  }
};
