// migrations/20260118_002_create_products_and_inventory.js
"use strict";

exports.up = async function up(knex) {
  const hasProducts = await knex.schema.hasTable("products");
  if (!hasProducts) {
    await knex.schema.createTable("products", (t) => {
      t.bigIncrements("id").primary();

      t.text("nome").notNullable();
      t.text("sku").notNullable().unique();

      // Categoria (opcional no MVP)
      t.bigInteger("category_id").unsigned().nullable()
        .references("id").inTable("categories")
        .onDelete("set null");

      // Catálogo público
      t.boolean("publicado").notNullable().defaultTo(false);

      // descrição simples por enquanto (depois fazemos imagens etc.)
      t.text("descricao");

      t.timestamp("criado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("atualizado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.raw(`CREATE INDEX IF NOT EXISTS products_nome_idx ON products (nome);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS products_publicado_idx ON products (publicado);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);`);
  }

  const hasInv = await knex.schema.hasTable("product_inventory");
  if (!hasInv) {
    await knex.schema.createTable("product_inventory", (t) => {
      t.bigIncrements("id").primary();

      t.bigInteger("product_id").unsigned().notNullable()
        .references("id").inTable("products")
        .onDelete("cascade");

      // estoque e custo
      t.integer("estoque_atual").notNullable().defaultTo(0);
      t.decimal("custo_medio", 12, 2).notNullable().defaultTo(0);

      t.timestamp("criado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("atualizado_em", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["product_id"]);
    });

    await knex.raw(`CREATE INDEX IF NOT EXISTS product_inventory_product_id_idx ON product_inventory (product_id);`);
  }
};

exports.down = async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS product_inventory_product_id_idx;`);
  await knex.schema.dropTableIfExists("product_inventory");

  await knex.raw(`DROP INDEX IF EXISTS products_category_id_idx;`);
  await knex.raw(`DROP INDEX IF EXISTS products_publicado_idx;`);
  await knex.raw(`DROP INDEX IF EXISTS products_nome_idx;`);
  await knex.schema.dropTableIfExists("products");
};
