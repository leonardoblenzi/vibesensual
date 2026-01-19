// src/routes/admin.routes.js
"use strict";

const express = require("express");
const router = express.Router();

const ensureAdmin = require("../middleware/ensureAdmin");

const ProdutosExtrasController = require("../controllers/ProdutosExtrasController");

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

// Imagens (URL)
router.get("/produtos/:id/imagens", ensureAdmin, ProdutosExtrasController.imagesPage);
router.post("/produtos/:id/imagens", ensureAdmin, ProdutosExtrasController.addImage);
router.post("/produtos/:id/imagens/:imageId/capa", ensureAdmin, ProdutosExtrasController.setCover);
router.post("/produtos/:id/imagens/:imageId/delete", ensureAdmin, ProdutosExtrasController.deleteImage);

// Variações
router.get("/produtos/:id/variacoes", ensureAdmin, ProdutosExtrasController.variantsPage);
router.post("/produtos/:id/variacoes", ensureAdmin, ProdutosExtrasController.addVariant);
router.post("/produtos/:id/variacoes/:variantId", ensureAdmin, ProdutosExtrasController.updateVariant);
router.post("/produtos/:id/variacoes/:variantId/delete", ensureAdmin, ProdutosExtrasController.deleteVariant);


module.exports = router;
