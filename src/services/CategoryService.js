// src/services/CategoryService.js
"use strict";

const db = require("../db/db");

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function listAll() {
  const { rows } = await db.query(
    `
    select id, nome, slug, ativa, criado_em, atualizado_em
    from categories
    order by nome asc
    `
  );
  return rows;
}

async function create({ nome, slug, ativa = true }) {
  if (!nome || !String(nome).trim()) {
    const err = new Error("Nome da categoria é obrigatório.");
    err.statusCode = 400;
    throw err;
  }

  const finalSlug = slugify(slug || nome);
  if (!finalSlug) {
    const err = new Error("Slug inválido.");
    err.statusCode = 400;
    throw err;
  }

  const { rows } = await db.query(
    `
    insert into categories (nome, slug, ativa, criado_em, atualizado_em)
    values ($1, $2, $3, now(), now())
    returning id, nome, slug, ativa
    `,
    [String(nome).trim(), finalSlug, !!ativa]
  );

  return rows[0];
}

async function update(id, { nome, slug, ativa }) {
  const cid = Number(id);
  if (!Number.isFinite(cid)) {
    const err = new Error("ID inválido.");
    err.statusCode = 400;
    throw err;
  }

  const finalNome = nome != null ? String(nome).trim() : null;
  const finalSlug = slug != null ? slugify(slug) : null;

  const { rows } = await db.query(
    `
    update categories
       set nome = coalesce($2, nome),
           slug = coalesce($3, slug),
           ativa = coalesce($4, ativa),
           atualizado_em = now()
     where id = $1
 returning id, nome, slug, ativa
    `,
    [cid, finalNome, finalSlug, ativa == null ? null : !!ativa]
  );

  if (!rows[0]) {
    const err = new Error("Categoria não encontrada.");
    err.statusCode = 404;
    throw err;
  }

  return rows[0];
}

async function remove(id) {
  const cid = Number(id);
  if (!Number.isFinite(cid)) {
    const err = new Error("ID inválido.");
    err.statusCode = 400;
    throw err;
  }

  // delete simples (depois a gente pode impedir se tiver produto vinculado)
  const { rowCount } = await db.query(`delete from categories where id = $1`, [cid]);

  if (!rowCount) {
    const err = new Error("Categoria não encontrada.");
    err.statusCode = 404;
    throw err;
  }

  return true;
}

module.exports = {
  listAll,
  create,
  update,
  remove,
  slugify,
};
