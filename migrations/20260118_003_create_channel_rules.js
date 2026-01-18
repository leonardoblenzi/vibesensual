// migrations/20260118_003_create_channel_rules.js
"use strict";

exports.up = async function (knex) {
  await knex.schema.createTable("channel_rules", (t) => {
    // canal como PK (shopee | ml | presencial)
    t.text("canal").primary();

    t.decimal("taxa_pct", 10, 4).notNullable().defaultTo(0);        // % (ex: 12.5)
    t.decimal("taxa_fixa", 12, 2).notNullable().defaultTo(0);       // R$
    t.decimal("desconto_medio", 12, 2).notNullable().defaultTo(0);  // R$
    t.decimal("frete_seller", 12, 2).notNullable().defaultTo(0);    // R$
    t.decimal("preco_de_add", 12, 2).notNullable().defaultTo(0);    // R$ (ex: custo embalagem)
    t.decimal("margem_min_pct", 10, 4).notNullable().defaultTo(0);  // % mínima

    t.timestamp("atualizado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Seeds mínimos (opcional, mas ajuda a UI a já ter os 3 canais)
  await knex("channel_rules")
    .insert([
      { canal: "shopee" },
      { canal: "ml" },
      { canal: "presencial" },
    ])
    .onConflict("canal")
    .ignore();
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("channel_rules");
};
