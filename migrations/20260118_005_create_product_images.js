"use strict";

exports.up = async function (knex) {
  await knex.schema.createTable("product_images", (t) => {
    t.bigIncrements("id").primary();

    t.bigInteger("product_id")
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");

    t.text("url").notNullable();
    t.text("alt");
    t.integer("ordem").notNullable().defaultTo(0);
    t.boolean("is_cover").notNullable().defaultTo(false);

    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.index(["product_id"]);
    t.index(["product_id", "is_cover"]);
  });

  // ✅ só 1 capa por produto (índice parcial Postgres)
  await knex.raw(`
    create unique index if not exists product_images_one_cover_per_product
    on product_images (product_id)
    where is_cover = true
  `);
};

exports.down = async function (knex) {
  await knex.raw(`drop index if exists product_images_one_cover_per_product`);
  await knex.schema.dropTableIfExists("product_images");
};
