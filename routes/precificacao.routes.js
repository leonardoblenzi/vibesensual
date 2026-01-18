// src/routes/precificacao.routes.js
"use strict";

const express = require("express");
const router = express.Router();

const PrecificacaoController = require("../controllers/PrecificacaoController");

// 🔒 se você já tiver auth middleware, pluga aqui:
// const { requireAdmin } = require("../middleware/auth");
// router.use(requireAdmin);

// View
router.get("/", PrecificacaoController.view);

// API
router.get("/data", PrecificacaoController.data);
router.post("/prices", PrecificacaoController.savePrices);
router.post("/rules", PrecificacaoController.saveRules);

module.exports = router;
