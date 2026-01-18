// src/controllers/CatalogoController.js
"use strict";

const CatalogoService = require("../services/CatalogoService");

const CANAIS = ["presencial", "shopee", "ml"];

function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

function pickCanal(q) {
  const raw = String(q || "").trim().toLowerCase();
  if (CANAIS.includes(raw)) return raw;

  const fromEnv = String(process.env.CATALOGO_CANAL || "presencial")
    .trim()
    .toLowerCase();

  return CANAIS.includes(fromEnv) ? fromEnv : "presencial";
}

module.exports = {
  async index(req, res, next) {
    try {
      const q = String(req.query.q || "").trim();
      const categoryId = String(req.query.categoryId || "").trim();
      const canal = pickCanal(req.query.canal);

      const whatsappNumber = onlyDigits(process.env.WHATSAPP_NUMBER);
      // se não setar, não quebra o catálogo; só esconde o botão
      const hasWhatsapp = whatsappNumber.length >= 10;

      const categories = await CatalogoService.listActiveCategories();
      const products = await CatalogoService.listPublicProducts({
        q: q || null,
        categoryId: categoryId || null,
        canal,
      });

      res.render("catalogo", {
        q,
        categoryId,
        canal,
        categories,
        products,
        whatsappNumber,
        hasWhatsapp,
      });
    } catch (err) {
      next(err);
    }
  },
};
