// src/routes/public.routes.js
"use strict";

const express = require("express");
const router = express.Router();

/**
 * MVP do catálogo público (sem DB ainda)
 * Depois a gente troca por ProductService.listPublic({q, categoria})
 */

// Home -> catálogo
router.get("/", (req, res) => {
  return res.redirect("/catalogo");
});

// Catálogo público
router.get("/catalogo", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();

  // ✅ mock temporário (depois vem do banco)
  const produtos = [
    { id: 1, nome: "Vibrador Compacto", preco: 49.9, tag: "Mais vendido" },
    { id: 2, nome: "Lubrificante Neutro", preco: 29.9, tag: "Promo" },
    { id: 3, nome: "Kit Sensual", preco: 89.9, tag: "Novo" },
  ];

  const filtrados = q
    ? produtos.filter((p) => (p.nome || "").toLowerCase().includes(q))
    : produtos;

  return res.render("catalogo", {
    lojaNome: "Vibe Sensual",
    q,
    produtos: filtrados,
  });
});

module.exports = router;
