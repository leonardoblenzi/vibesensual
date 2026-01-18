// migrations/20260118_004_create_product_prices.js
"use strict";

exports.up = async function (knex) {
  await knex.schema.createTable("product_prices", (t) => {
    t.bigIncrements("id").primary();

    // FK -> products.id (se seu products.id for uuid, troque para uuid aqui)
    t
      .bigInteger("product_id")
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");

    // canal: shopee | ml | presencial
    t.text("canal").notNullable();

    // preço de venda final salvo
    t.decimal("preco_venda", 12, 2).notNullable();

    t.timestamp("atualizado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // garante 1 preço por produto/canal
    t.unique(["product_id", "canal"]);
    t.index(["canal"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("product_prices");
};
