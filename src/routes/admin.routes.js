// src/routes/admin.routes.js
"use strict";

const express = require("express");
const router = express.Router();

const ensureAdmin = require("../middleware/ensureAdmin");

const AdminAuthController = require("../controllers/AdminAuthController");

// páginas do admin (já existiam)
const precificacaoRoutes = require("./precificacao.routes");

// novas rotas
const categoriasRoutes = require("./categorias.routes");
const produtosRoutes = require("./produtos.routes");

// auth (sem proteção)
router.get("/login", AdminAuthController.viewLogin);
router.post("/login", AdminAuthController.doLogin);
router.post("/logout", AdminAuthController.logout);

// dashboard admin (protegido)
router.get("/", ensureAdmin, (req, res) => {
  return res.render("admin/home");
});

// sub-rotas protegidas
router.use("/precificacao", ensureAdmin, precificacaoRoutes);
router.use("/categorias", ensureAdmin, categoriasRoutes);
router.use("/produtos", ensureAdmin, produtosRoutes);

module.exports = router;
