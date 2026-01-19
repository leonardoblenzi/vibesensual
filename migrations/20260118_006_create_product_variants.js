"use strict";

exports.up = async function (knex) {
  await knex.schema.createTable("product_variants", (t) => {
    t.bigIncrements("id").primary();

    t.bigInteger("product_id")
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");

    // ex: "Cor"
    t.text("atributo").notNullable().defaultTo("Cor");
    // ex: "Pink", "Roxo", "Preto"
    t.text("opcao").notNullable();

    // opcional: SKU por variação
    t.text("sku_variant");

    // adicional no preço (ex: +2.00)
    t.decimal("adicional_preco", 12, 2).notNullable().defaultTo(0);

    // estoque por variação
    t.integer("estoque_atual").notNullable().defaultTo(0);

    t.boolean("ativo").notNullable().defaultTo(true);
    t.integer("ordem").notNullable().defaultTo(0);

    // opcional: imagem específica da variação
    t.text("image_url");

    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.index(["product_id"]);
    t.index(["product_id", "atributo"]);
    t.unique(["product_id", "atributo", "opcao"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("product_variants");
};
