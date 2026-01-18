// src/services/CatalogoService.js
"use strict";

const db = require("../db/db");

const CANAIS = ["presencial", "shopee", "ml"];

function pickCanal(canal) {
  const c = String(canal || "").toLowerCase().trim();
  return CANAIS.includes(c) ? c : "presencial";
}

module.exports = {
  async listActiveCategories() {
    // se sua tabela categories não tiver "ativa", ajuste aqui.
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

    // filtros opcionais sem quebrar query
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
        c.slug as category_slug,

        coalesce(i.estoque_atual, 0) as estoque_atual,
        coalesce(i.custo_medio, 0) as custo_medio,

        pr.preco_venda as preco_venda

      from products p
      left join categories c
        on c.id = p.category_id
      left join product_inventory i
        on i.product_id = p.id
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
      category_id: r.category_id ? String(r.category_id) : "",
      category_nome: r.category_nome || "",
      category_slug: r.category_slug || "",
      estoque_atual: Number(r.estoque_atual || 0),
      custo_medio: Number(r.custo_medio || 0),
      preco_venda: r.preco_venda === null || r.preco_venda === undefined ? null : Number(r.preco_venda),
    }));
  },
};
