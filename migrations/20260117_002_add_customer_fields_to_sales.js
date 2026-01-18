// migrations/20260117_002_add_customer_fields_to_sales.js
"use strict";

exports.up = async function up(knex) {
  const hasSales = await knex.schema.hasTable("sales");

  // Se a tabela sales ainda não existe, cria uma versão mínima
  // (a gente expande depois quando fizer a feature de Vendas completa)
  if (!hasSales) {
    await knex.schema.createTable("sales", (t) => {
      t.bigIncrements("id").primary();

      t.text("canal").notNullable(); // shopee | ml | presencial
      t.timestamp("data_venda", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      // Cliente (opcional)
      t.bigInteger("customer_id").unsigned().nullable()
        .references("id").inTable("customers")
        .onDelete("set null");

      t.text("customer_nome_snapshot");
      t.text("customer_telefone_snapshot");
      t.text("customer_email_snapshot");

      t.timestamp("criado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.raw(`CREATE INDEX IF NOT EXISTS sales_customer_id_idx ON sales (customer_id);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS sales_canal_idx ON sales (canal);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS sales_data_venda_idx ON sales (data_venda);`);
    return;
  }

  // Se sales existe: só adiciona os campos
  const hasCustomerId = await knex.schema.hasColumn("sales", "customer_id");
  if (!hasCustomerId) {
    await knex.schema.alterTable("sales", (t) => {
      t.bigInteger("customer_id").unsigned().nullable()
        .references("id").inTable("customers")
        .onDelete("set null");
    });
  }

  const cols = [
    ["customer_nome_snapshot", "text"],
    ["customer_telefone_snapshot", "text"],
    ["customer_email_snapshot", "text"],
  ];

  for (const [col] of cols) {
    const exists = await knex.schema.hasColumn("sales", col);
    if (!exists) {
      await knex.schema.alterTable("sales", (t) => {
        t.text(col);
      });
    }
  }

  await knex.raw(`CREATE INDEX IF NOT EXISTS sales_customer_id_idx ON sales (customer_id);`);
};

exports.down = async function down(knex) {
  const hasSales = await knex.schema.hasTable("sales");
  if (!hasSales) return;

  // remove índice
  await knex.raw(`DROP INDEX IF EXISTS sales_customer_id_idx;`);

  // se você quiser derrubar a sales criada “mínima”, pode:
  // await knex.schema.dropTableIfExists("sales");
  // mas por segurança, só removo colunas (quando existirem)

  const cols = ["customer_email_snapshot", "customer_telefone_snapshot", "customer_nome_snapshot", "customer_id"];
  for (const col of cols) {
    const exists = await knex.schema.hasColumn("sales", col);
    if (exists) {
      await knex.schema.alterTable("sales", (t) => t.dropColumn(col));
    }
  }
};
