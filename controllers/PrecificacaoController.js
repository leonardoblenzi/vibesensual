// src/controllers/PrecificacaoController.js
"use strict";

const PrecificacaoService = require("../services/PrecificacaoService");

function safeNum(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// canais permitidos no sistema
const CANAIS = new Set(["shopee", "ml", "presencial"]);

module.exports = {
  // =========================
  // Views
  // =========================
  async view(req, res) {
    // aqui você pode colocar label do ambiente, nome da conta, etc.
    return res.render("admin/precificacao", {
      envLabel: process.env.RENDER ? "Render • Postgres" : "Local • Postgres",
    });
  },

  // =========================
  // API: payload único (products + prices + rules)
  // GET /admin/precificacao/data
  // =========================
  async data(req, res) {
    try {
      const data = await PrecificacaoService.getData();

      return res.json({
        ok: true,
        products: data.products,
        pricesByProductId: data.pricesByProductId,
        rules: data.rules,
      });
    } catch (err) {
      console.error("PrecificacaoController.data error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Erro ao carregar dados." });
    }
  },

  // =========================
  // API: salvar preços (somente diffs)
  // POST /admin/precificacao/prices
  // body: { updates: [{ productId, canal, price }] }
  // =========================
  async savePrices(req, res) {
    try {
      const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];

      if (!updates.length) {
        return res.status(400).json({ ok: false, error: "Nenhuma atualização enviada." });
      }

      // validação básica
      const clean = [];
      for (const u of updates) {
        const productId = String(u.productId || "").trim();
        const canal = String(u.canal || "").trim();
        const priceRaw = u.price;

        if (!productId) continue;
        if (!CANAIS.has(canal)) continue;

        // aceita null para "limpar" preço
        let price = null;
        if (priceRaw !== null && priceRaw !== undefined) {
          const n = safeNum(priceRaw, NaN);
          if (Number.isFinite(n) && n > 0) price = n;
        }

        clean.push({ productId, canal, price });
      }

      if (!clean.length) {
        return res.status(400).json({ ok: false, error: "Atualizações inválidas." });
      }

      await PrecificacaoService.savePrices(clean);

      return res.json({ ok: true });
    } catch (err) {
      console.error("PrecificacaoController.savePrices error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Erro ao salvar preços." });
    }
  },

  // =========================
  // API: salvar regras globais
  // POST /admin/precificacao/rules
  // body: { rules: { shopee: {...}, ml: {...}, presencial: {...} } }
  // =========================
  async saveRules(req, res) {
    try {
      const rules = req.body?.rules;
      if (!rules || typeof rules !== "object") {
        return res.status(400).json({ ok: false, error: "Regras ausentes ou inválidas." });
      }

      const clean = {};
      for (const canal of CANAIS) {
        const r = rules[canal];
        if (!r || typeof r !== "object") continue;

        // campos permitidos
        const taxa_pct = safeNum(r.taxa_pct, 0);
        const taxa_fixa = safeNum(r.taxa_fixa, 0);
        const desconto_medio = safeNum(r.desconto_medio, 0);
        const frete_seller = safeNum(r.frete_seller, 0);
        const preco_de_add = safeNum(r.preco_de_add, 0);
        const margem_min_pct = safeNum(r.margem_min_pct, 0);

        // clamps razoáveis
        clean[canal] = {
          taxa_pct: Math.max(0, Math.min(99.99, taxa_pct)),
          taxa_fixa: Math.max(0, taxa_fixa),
          desconto_medio: Math.max(0, desconto_medio),
          frete_seller: Math.max(0, frete_seller),
          preco_de_add: Math.max(0, preco_de_add),
          margem_min_pct: Math.max(0, Math.min(99.99, margem_min_pct)),
        };
      }

      // garante que veio tudo
      for (const canal of CANAIS) {
        if (!clean[canal]) {
          return res.status(400).json({ ok: false, error: `Regras do canal '${canal}' ausentes.` });
        }
      }

      await PrecificacaoService.saveRules(clean);

      return res.json({ ok: true });
    } catch (err) {
      console.error("PrecificacaoController.saveRules error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Erro ao salvar regras." });
    }
  },
};
