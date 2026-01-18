// src/routes/admin.routes.js
"use strict";

const express = require("express");
const router = express.Router();

const precificacaoRoutes = require("./precificacao.routes");

// 🔒 se você já tiver auth middleware do admin, usa aqui no router inteiro:
// const { requireAdmin } = require("../middleware/auth");
// router.use(requireAdmin);

// Home do admin (placeholder)
router.get("/", (req, res) => res.redirect("/admin/dashboard"));
router.get("/dashboard", (req, res) => {
  // depois a gente faz a view do dashboard
  res.send("Dashboard (em breve)");
});

// Feature: Precificação
router.use("/precificacao", precificacaoRoutes);

// Logout (placeholder) — troca pro seu esquema real
router.post("/logout", (req, res) => {
  // se você usar sessão/cookie, limpa aqui
  // req.session.destroy(() => res.redirect("/"));
  res.redirect("/");
});

module.exports = router;
