// src/services/ProductService.js
"use strict";

const db = require("../db/db");

async function listAdmin({ q = "", categoryId = "" } = {}) {
  const term = String(q || "").trim();
  const cat = categoryId ? Number(categoryId) : null;

  const params = [];
  let where = "where 1=1";

  if (term) {
    params.push(`%${term}%`);
    where += ` and (p.nome ilike $${params.length} or p.sku ilike $${params.length})`;
  }
  if (cat && Number.isFinite(cat)) {
    params.push(cat);
    where += ` and p.category_id = $${params.length}`;
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
      coalesce(i.custo_medio, 0) as custo_medio
    from products p
    left join categories c on c.id = p.category_id
    left join product_inventory i on i.product_id = p.id
    ${where}
    order by p.nome asc
    `,
    params
  );

  return rows;
}

async function create({
  nome,
  sku,
  descricao = null,
  publicado = false,
  category_id = null,
  estoque_atual = 0,
  custo_medio = 0,
}) {
  if (!nome || !String(nome).trim()) {
    const err = new Error("Nome do produto é obrigatório.");
    err.statusCode = 400;
    throw err;
  }
  if (!sku || !String(sku).trim()) {
    const err = new Error("SKU é obrigatório.");
    err.statusCode = 400;
    throw err;
  }

  const client = await db.getClient();
  try {
    await client.query("begin");

    const { rows: pRows } = await client.query(
      `
      insert into products (nome, sku, descricao, publicado, category_id, criado_em, atualizado_em)
      values ($1, $2, $3, $4, $5, now(), now())
      returning id, nome, sku, publicado, category_id
      `,
      [
        String(nome).trim(),
        String(sku).trim(),
        descricao ? String(descricao).trim() : null,
        !!publicado,
        category_id ? Number(category_id) : null,
      ]
    );

    const product = pRows[0];

    await client.query(
      `
      insert into product_inventory (product_id, estoque_atual, custo_medio, criado_em, atualizado_em)
      values ($1, $2, $3, now(), now())
      on conflict (product_id)
      do update set estoque_atual = excluded.estoque_atual,
                    custo_medio = excluded.custo_medio,
                    atualizado_em = now()
      `,
      [product.id, Number(estoque_atual) || 0, Number(custo_medio) || 0]
    );

    await client.query("commit");
    return product;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

async function update(id, payload) {
  const pid = Number(id);
  if (!Number.isFinite(pid)) {
    const err = new Error("ID inválido.");
    err.statusCode = 400;
    throw err;
  }

  const nome = payload.nome != null ? String(payload.nome).trim() : null;
  const sku = payload.sku != null ? String(payload.sku).trim() : null;
  const descricao = payload.descricao != null ? String(payload.descricao).trim() : null;
  const publicado = payload.publicado != null ? !!payload.publicado : null;
  const category_id = payload.category_id ? Number(payload.category_id) : null;

  const estoque_atual = payload.estoque_atual != null ? Number(payload.estoque_atual) : null;
  const custo_medio = payload.custo_medio != null ? Number(payload.custo_medio) : null;

  const client = await db.getClient();
  try {
    await client.query("begin");

    const { rows } = await client.query(
      `
      update products
         set nome = coalesce($2, nome),
             sku = coalesce($3, sku),
             descricao = coalesce($4, descricao),
             publicado = coalesce($5, publicado),
             category_id = coalesce($6, category_id),
             atualizado_em = now()
       where id = $1
   returning id, nome, sku, publicado, category_id
      `,
      [pid, nome, sku, descricao, publicado, category_id]
    );

    if (!rows[0]) {
      const err = new Error("Produto não encontrado.");
      err.statusCode = 404;
      throw err;
    }

    // atualiza estoque/custo se vierem
    if (estoque_atual != null || custo_medio != null) {
      await client.query(
        `
        insert into product_inventory (product_id, estoque_atual, custo_medio, criado_em, atualizado_em)
        values ($1, $2, $3, now(), now())
        on conflict (product_id)
        do update set
          estoque_atual = coalesce($2, product_inventory.estoque_atual),
          custo_medio = coalesce($3, product_inventory.custo_medio),
          atualizado_em = now()
        `,
        [
          pid,
          estoque_atual == null ? null : estoque_atual,
          custo_medio == null ? null : custo_medio,
        ]
      );
    }

    await client.query("commit");
    return rows[0];
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

async function remove(id) {
  const pid = Number(id);
  if (!Number.isFinite(pid)) {
    const err = new Error("ID inválido.");
    err.statusCode = 400;
    throw err;
  }

  const { rowCount } = await db.query(`delete from products where id = $1`, [pid]);
  if (!rowCount) {
    const err = new Error("Produto não encontrado.");
    err.statusCode = 404;
    throw err;
  }

  return true;
}

module.exports = {
  listAdmin,
  create,
  update,
  remove,
};
