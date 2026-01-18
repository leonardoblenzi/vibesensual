// src/services/PrecificacaoService.js
"use strict";

/**
 * Este service assume que você tem:
 *
 * 1) products
 *    - id (uuid ou bigserial)  [aqui tratamos como string]
 *    - nome (text)
 *    - sku (text unique)
 *
 * 2) product_inventory
 *    - product_id (FK products.id)
 *    - estoque_atual (int)
 *    - custo_medio (numeric)  // ou custo_atual
 *
 * 3) product_prices
 *    - id (bigserial/uuid)
 *    - product_id (FK)
 *    - canal (text)          // 'shopee'|'ml'|'presencial'
 *    - preco_venda (numeric)
 *    - atualizado_em (timestamptz)
 *    UNIQUE(product_id, canal)
 *
 * 4) channel_rules
 *    - canal (text PK)
 *    - taxa_pct (numeric)
 *    - taxa_fixa (numeric)
 *    - desconto_medio (numeric)
 *    - frete_seller (numeric)
 *    - preco_de_add (numeric)
 *    - margem_min_pct (numeric)
 *    - atualizado_em (timestamptz)
 */

const db = require("../db/db"); // você vai criar esse arquivo: exporta { query, getClient }

const CANAIS = ["shopee", "ml", "presencial"];

function num(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function emptyRules() {
  return {
    shopee: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
    ml: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
    presencial: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
  };
}

module.exports = {
  // =========================
  // Load all data for UI
  // =========================
  async getData() {
    const products = await this.listProducts();
    const pricesByProductId = await this.getPricesByProductId();
    const rules = await this.getRules();

    return { products, pricesByProductId, rules };
  },

  // =========================
  // Products (with inventory)
  // =========================
  async listProducts() {
    // Ajuste se suas colunas tiverem nomes diferentes
    const { rows } = await db.query(
      `
      select
        p.id,
        p.nome,
        p.sku,
        coalesce(i.estoque_atual, 0) as estoque_atual,
        coalesce(i.custo_medio, 0) as custo_medio
      from products p
      left join product_inventory i
        on i.product_id = p.id
      order by p.nome asc
      `
    );

    return rows.map((r) => ({
      id: String(r.id),
      nome: r.nome,
      sku: r.sku,
      estoque_atual: Number(r.estoque_atual ?? 0),
      custo_medio: num(r.custo_medio, 0),
      // compat: o JS tenta p.custo também
      custo: num(r.custo_medio, 0),
    }));
  },

  // =========================
  // Prices map for UI
  // =========================
  async getPricesByProductId() {
    const { rows } = await db.query(
      `
      select
        product_id,
        canal,
        preco_venda
      from product_prices
      `
    );

    const map = {};
    for (const r of rows) {
      const pid = String(r.product_id);
      map[pid] ||= { shopee: null, ml: null, presencial: null };

      if (CANAIS.includes(r.canal)) {
        map[pid][r.canal] = num(r.preco_venda, null);
      }
    }
    return map;
  },

  // =========================
  // Rules for UI
  // =========================
  async getRules() {
    const base = emptyRules();

    const { rows } = await db.query(`select * from channel_rules`);
    for (const r of rows) {
      const canal = String(r.canal);
      if (!CANAIS.includes(canal)) continue;

      base[canal] = {
        taxa_pct: num(r.taxa_pct, 0),
        taxa_fixa: num(r.taxa_fixa, 0),
        desconto_medio: num(r.desconto_medio, 0),
        frete_seller: num(r.frete_seller, 0),
        preco_de_add: num(r.preco_de_add, 0),
        margem_min_pct: num(r.margem_min_pct, 0),
      };
    }

    // se não existir no banco ainda, retorna base com zeros
    return base;
  },

  // =========================
  // Save prices (diff list)
  // updates: [{ productId, canal, price }]
  // =========================
  async savePrices(updates) {
    const client = await db.getClient();
    try {
      await client.query("begin");

      // valida IDs/canais
      const clean = updates
        .filter((u) => u && u.productId && CANAIS.includes(u.canal))
        .map((u) => ({
          productId: String(u.productId),
          canal: String(u.canal),
          price: u.price === null ? null : num(u.price, null),
        }));

      if (!clean.length) return;

      // Upsert por item
      for (const u of clean) {
        if (u.price === null) {
          // "limpar" preço
          await client.query(
            `delete from product_prices where product_id = $1 and canal = $2`,
            [u.productId, u.canal]
          );
        } else {
          await client.query(
            `
            insert into product_prices (product_id, canal, preco_venda, atualizado_em)
            values ($1, $2, $3, now())
            on conflict (product_id, canal)
            do update set preco_venda = excluded.preco_venda, atualizado_em = now()
            `,
            [u.productId, u.canal, u.price]
          );
        }
      }

      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  },

  // =========================
  // Save rules
  // rules: { shopee:{...}, ml:{...}, presencial:{...} }
  // =========================
  async saveRules(rules) {
    const client = await db.getClient();
    try {
      await client.query("begin");

      for (const canal of CANAIS) {
        const r = rules[canal];
        if (!r) continue;

        await client.query(
          `
          insert into channel_rules
            (canal, taxa_pct, taxa_fixa, desconto_medio, frete_seller, preco_de_add, margem_min_pct, atualizado_em)
          values
            ($1, $2, $3, $4, $5, $6, $7, now())
          on conflict (canal)
          do update set
            taxa_pct = excluded.taxa_pct,
            taxa_fixa = excluded.taxa_fixa,
            desconto_medio = excluded.desconto_medio,
            frete_seller = excluded.frete_seller,
            preco_de_add = excluded.preco_de_add,
            margem_min_pct = excluded.margem_min_pct,
            atualizado_em = now()
          `,
          [
            canal,
            num(r.taxa_pct, 0),
            num(r.taxa_fixa, 0),
            num(r.desconto_medio, 0),
            num(r.frete_seller, 0),
            num(r.preco_de_add, 0),
            num(r.margem_min_pct, 0),
          ]
        );
      }

      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  },
};
