"use strict";

const db = require("../db/db");

const CANAIS = ["presencial", "shopee", "ml"];

function pickCanal(canal) {
  const c = String(canal || "").toLowerCase().trim();
  return CANAIS.includes(c) ? c : "presencial";
}

module.exports = {
  async listActiveCategories() {
    const { rows } = await db.query(
      `
      select id, nome, slug, ativa
      from categories
      where coalesce(ativa, true) = true
      order by nome asc
      `
    );
    return rows;
  },

  async listPublicProducts({ q, categoryId, canal }) {
    const canalOk = pickCanal(canal);

    const hasQ = q && String(q).trim().length > 0;
    const hasCat = categoryId && String(categoryId).trim().length > 0;

    const params = [canalOk];
    let idx = 2;

    let where = `where p.publicado = true`;
    if (hasQ) {
      where += ` and (p.nome ilike '%'||$${idx}||'%' or p.sku ilike '%'||$${idx}||'%')`;
      params.push(String(q).trim());
      idx++;
    }
    if (hasCat) {
      where += ` and p.category_id::text = $${idx}::text`;
      params.push(String(categoryId).trim());
      idx++;
    }

    const { rows } = await db.query(
      `
      select
        p.id,
        p.nome,
        p.sku,
        p.descricao,
        p.publicado,
        p.category_id,

        c.nome as category_nome,

        coalesce(i.estoque_atual, 0) as estoque_atual,

        pr.preco_venda as preco_venda,
        pr.preco_de as preco_de,

        -- capa (se existir)
        (
          select pi.url
          from product_images pi
          where pi.product_id = p.id
          order by pi.is_cover desc, pi.ordem asc, pi.id asc
          limit 1
        ) as cover_url

      from products p
      left join categories c on c.id = p.category_id
      left join product_inventory i on i.product_id = p.id
      left join product_prices pr
        on pr.product_id = p.id
       and pr.canal = $1
      ${where}
      order by p.nome asc
      `,
      params
    );

    return rows.map((r) => ({
      id: String(r.id),
      nome: r.nome,
      sku: r.sku,
      descricao: r.descricao || "",
      category_nome: r.category_nome || "",
      estoque_atual: Number(r.estoque_atual || 0),
      preco_venda: r.preco_venda == null ? null : Number(r.preco_venda),
      preco_de: r.preco_de == null ? null : Number(r.preco_de),
      cover_url: r.cover_url || "",
    }));
  },

  async getPublicProductById({ id, canal }) {
    const canalOk = pickCanal(canal);

    const { rows } = await db.query(
      `
      select
        p.id,
        p.nome,
        p.sku,
        p.descricao,
        p.descricao_longa,
        p.publicado,
        p.category_id,
        c.nome as category_nome,

        coalesce(i.estoque_atual, 0) as estoque_atual,

        pr.preco_venda as preco_venda,
        pr.preco_de as preco_de

      from products p
      left join categories c on c.id = p.category_id
      left join product_inventory i on i.product_id = p.id
      left join product_prices pr
        on pr.product_id = p.id
       and pr.canal = $2
      where p.id = $1
        and p.publicado = true
      limit 1
      `,
      [String(id), canalOk]
    );

    const product = rows[0] || null;
    if (!product) return null;

    const images = await db.query(
      `
      select id, url, alt, ordem, is_cover
      from product_images
      where product_id = $1
      order by is_cover desc, ordem asc, id asc
      `,
      [String(id)]
    );

    const variants = await db.query(
      `
      select
        id,
        atributo,
        opcao,
        sku_variant,
        adicional_preco,
        estoque_atual,
        ativo,
        ordem,
        image_url
      from product_variants
      where product_id = $1
      order by atributo asc, ordem asc, opcao asc
      `,
      [String(id)]
    );

    return {
      id: String(product.id),
      nome: product.nome,
      sku: product.sku,
      descricao: product.descricao || "",
      descricao_longa: product.descricao_longa || "",
      category_nome: product.category_nome || "",
      estoque_atual: Number(product.estoque_atual || 0),
      preco_venda: product.preco_venda == null ? null : Number(product.preco_venda),
      preco_de: product.preco_de == null ? null : Number(product.preco_de),
      images: images.rows || [],
      variants: (variants.rows || []).map((v) => ({
        id: String(v.id),
        atributo: v.atributo || "Cor",
        opcao: v.opcao,
        sku_variant: v.sku_variant || "",
        adicional_preco: Number(v.adicional_preco || 0),
        estoque_atual: Number(v.estoque_atual || 0),
        ativo: !!v.ativo,
        ordem: Number(v.ordem || 0),
        image_url: v.image_url || "",
      })),
    };
  },
};
