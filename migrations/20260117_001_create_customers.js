// migrations/20260117_001_create_customers.js
"use strict";

exports.up = async function up(knex) {
  const has = await knex.schema.hasTable("customers");
  if (has) return;

  await knex.schema.createTable("customers", (t) => {
    t.bigIncrements("id").primary();

    t.text("nome");
    t.text("telefone");
    t.text("telefone_norm"); // só dígitos
    t.text("email");
    t.text("email_norm"); // lower(trim)
    t.text("instagram");

    t.text("origem"); // shopee | ml | presencial | instagram | whatsapp | outro
    t.text("tags"); // ex: "vip, recorrente"
    t.text("observacoes");

    t.timestamp("criado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("atualizado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Únicos parciais (Postgres) — evita duplicados quando o campo existe
  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS customers_email_norm_uq
    ON customers (email_norm)
    WHERE email_norm IS NOT NULL AND email_norm <> '';
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS customers_telefone_norm_uq
    ON customers (telefone_norm)
    WHERE telefone_norm IS NOT NULL AND telefone_norm <> '';
  `);

  // Índices para busca rápida
  await knex.raw(`CREATE INDEX IF NOT EXISTS customers_nome_idx ON customers (nome);`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS customers_origem_idx ON customers (origem);`);
};

exports.down = async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS customers_origem_idx;`);
  await knex.raw(`DROP INDEX IF EXISTS customers_nome_idx;`);
  await knex.raw(`DROP INDEX IF EXISTS customers_telefone_norm_uq;`);
  await knex.raw(`DROP INDEX IF EXISTS customers_email_norm_uq;`);
  await knex.schema.dropTableIfExists("customers");
};
