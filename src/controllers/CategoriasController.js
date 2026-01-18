// src/controllers/CategoriasController.js
"use strict";

const CategoryService = require("../services/CategoryService");

async function index(req, res) {
  const categories = await CategoryService.listAll();
  return res.render("admin/categorias", { categories });
}

async function create(req, res) {
  const { nome, slug, ativa } = req.body;

  await CategoryService.create({
    nome,
    slug,
    ativa: ativa === "on" || ativa === true || ativa === "true",
  });

  return res.redirect("/admin/categorias");
}

async function update(req, res) {
  const id = req.params.id;
  const { nome, slug, ativa } = req.body;

  await CategoryService.update(id, {
    nome,
    slug,
    ativa: ativa === "on" || ativa === true || ativa === "true",
  });

  return res.redirect("/admin/categorias");
}

async function remove(req, res) {
  const id = req.params.id;
  await CategoryService.remove(id);
  return res.redirect("/admin/categorias");
}

module.exports = {
  index,
  create,
  update,
  remove,
};
