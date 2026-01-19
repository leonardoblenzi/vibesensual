"use strict";

const db = require("../db/db");

function num(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

module.exports = {
  async getProductBasic(productId) {
    const { rows } = await db.query(
      `
      select id, nome, sku
      from products
      where id = $1
      limit 1
      `,
      [String(productId)]
    );
    return rows[0] || null;
  },

  // =========================
  // IMAGENS (URL)
  // =========================
  async listImages(productId) {
    const { rows } = await db.query(
      `
      select id, url, alt, ordem, is_cover
      from product_images
      where product_id = $1
      order by is_cover desc, ordem asc, id asc
      `,
      [String(productId)]
    );
    return rows;
  },

  async addImage(productId, { url, alt, ordem, is_cover }) {
    const cleanUrl = String(url || "").trim();
    if (!cleanUrl) throw new Error("URL da imagem é obrigatória.");

    const cleanAlt = String(alt || "").trim();
    const cleanOrdem = Math.max(0, Math.floor(num(ordem, 0)));
    const cover = !!is_cover;

    const client = await db.getClient();
    try {
      await client.query("begin");

      if (cover) {
        // tira capa anterior
        await client.query(
          `update product_images set is_cover = false where product_id = $1`,
          [String(productId)]
        );
      }

      await client.query(
        `
        insert into product_images (product_id, url, alt, ordem, is_cover, created_at)
        values ($1, $2, $3, $4, $5, now())
        `,
        [String(productId), cleanUrl, cleanAlt || null, cleanOrdem, cover]
      );

      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  },

  async setCover(productId, imageId) {
    const client = await db.getClient();
    try {
      await client.query("begin");

      await client.query(
        `update product_images set is_cover = false where product_id = $1`,
        [String(productId)]
      );

      await client.query(
        `
        update product_images
        set is_cover = true
        where id = $1 and product_id = $2
        `,
        [String(imageId), String(productId)]
      );

      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  },

  async deleteImage(productId, imageId) {
    await db.query(
      `delete from product_images where id = $1 and product_id = $2`,
      [String(imageId), String(productId)]
    );
  },

  // =========================
  // VARIAÇÕES
  // =========================
  async listVariants(productId) {
    const { rows } = await db.query(
      `
      select
        id, atributo, opcao, sku_variant, adicional_preco,
        estoque_atual, ativo, ordem, image_url
      from product_variants
      where product_id = $1
      order by atributo asc, ordem asc, opcao asc
      `,
      [String(productId)]
    );
    return rows.map((v) => ({
      id: String(v.id),
      atributo: v.atributo || "Cor",
      opcao: v.opcao,
      sku_variant: v.sku_variant || "",
      adicional_preco: num(v.adicional_preco, 0),
      estoque_atual: num(v.estoque_atual, 0),
      ativo: !!v.ativo,
      ordem: num(v.ordem, 0),
      image_url: v.image_url || "",
    }));
  },

  async addVariant(productId, payload) {
    const atributo = String(payload.atributo || "Cor").trim() || "Cor";
    const opcao = String(payload.opcao || "").trim();
    if (!opcao) throw new Error("Opção da variação é obrigatória (ex: Pink).");

    const sku_variant = String(payload.sku_variant || "").trim();
    const adicional_preco = num(payload.adicional_preco, 0);
    const estoque_atual = Math.max(0, Math.floor(num(payload.estoque_atual, 0)));
    const ativo = payload.ativo === "on" || payload.ativo === true;
    const ordem = Math.max(0, Math.floor(num(payload.ordem, 0)));
    const image_url = String(payload.image_url || "").trim();

    await db.query(
      `
      insert into product_variants
        (product_id, atributo, opcao, sku_variant, adicional_preco, estoque_atual, ativo, ordem, image_url, created_at)
      values
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
      `,
      [
        String(productId),
        atributo,
        opcao,
        sku_variant || null,
        adicional_preco,
        estoque_atual,
        ativo,
        ordem,
        image_url || null,
      ]
    );
  },

  async updateVariant(productId, variantId, payload) {
    const atributo = String(payload.atributo || "Cor").trim() || "Cor";
    const opcao = String(payload.opcao || "").trim();
    if (!opcao) throw new Error("Opção da variação é obrigatória.");

    const sku_variant = String(payload.sku_variant || "").trim();
    const adicional_preco = num(payload.adicional_preco, 0);
    const estoque_atual = Math.max(0, Math.floor(num(payload.estoque_atual, 0)));
    const ativo = payload.ativo === "on" || payload.ativo === true;
    const ordem = Math.max(0, Math.floor(num(payload.ordem, 0)));
    const image_url = String(payload.image_url || "").trim();

    await db.query(
      `
      update product_variants
      set
        atributo = $1,
        opcao = $2,
        sku_variant = $3,
        adicional_preco = $4,
        estoque_atual = $5,
        ativo = $6,
        ordem = $7,
        image_url = $8
      where id = $9 and product_id = $10
      `,
      [
        atributo,
        opcao,
        sku_variant || null,
        adicional_preco,
        estoque_atual,
        ativo,
        ordem,
        image_url || null,
        String(variantId),
        String(productId),
      ]
    );
  },

  async deleteVariant(productId, variantId) {
    await db.query(
      `delete from product_variants where id = $1 and product_id = $2`,
      [String(variantId), String(productId)]
    );
  },
};
