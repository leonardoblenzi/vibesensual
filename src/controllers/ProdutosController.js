// src/controllers/ProdutosController.js
"use strict";

const ProductService = require("../services/ProductService");
const CategoryService = require("../services/CategoryService");

async function index(req, res) {
  const q = String(req.query.q || "");
  const categoryId = String(req.query.categoryId || "");

  const [products, categories] = await Promise.all([
    ProductService.listAdmin({ q, categoryId }),
    CategoryService.listAll(),
  ]);

  return res.render("admin/produtos", { products, categories, q, categoryId });
}

async function create(req, res) {
  const {
    nome,
    sku,
    descricao,
    publicado,
    category_id,
    estoque_atual,
    custo_medio,
  } = req.body;

  await ProductService.create({
    nome,
    sku,
    descricao,
    publicado: publicado === "on" || publicado === true || publicado === "true",
    category_id: category_id || null,
    estoque_atual,
    custo_medio,
  });

  return res.redirect("/admin/produtos");
}

async function update(req, res) {
  const id = req.params.id;

  const payload = {
    nome: req.body.nome,
    sku: req.body.sku,
    descricao: req.body.descricao,
    publicado: req.body.publicado === "on" || req.body.publicado === true || req.body.publicado === "true",
    category_id: req.body.category_id || null,
    estoque_atual: req.body.estoque_atual,
    custo_medio: req.body.custo_medio,
  };

  await ProductService.update(id, payload);
  return res.redirect("/admin/produtos");
}

async function remove(req, res) {
  const id = req.params.id;
  await ProductService.remove(id);
  return res.redirect("/admin/produtos");
}

module.exports = {
  index,
  create,
  update,
  remove,
};
