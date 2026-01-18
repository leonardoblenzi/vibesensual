// migrations/20260118_001_create_categories.js
"use strict";

exports.up = async function up(knex) {
  const has = await knex.schema.hasTable("categories");
  if (has) return;

  await knex.schema.createTable("categories", (t) => {
    t.bigIncrements("id").primary();

    t.text("nome").notNullable();
    t.text("slug").notNullable().unique(); // ex: "vibradores", "lubrificantes"
    t.boolean("ativa").notNullable().defaultTo(true);

    t.timestamp("criado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("atualizado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`CREATE INDEX IF NOT EXISTS categories_nome_idx ON categories (nome);`);
};

exports.down = async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS categories_nome_idx;`);
  await knex.schema.dropTableIfExists("categories");
};
