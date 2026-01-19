// src/services/PrecificacaoService.js
"use strict";

/**
 * Espera:
 * - product_prices: (product_id, canal, preco_venda, preco_de, atualizado_em)
 *   UNIQUE(product_id, canal)
 * - channel_rules como já estava
 */

const db = require("../db/db");

const CANAIS = ["shopee", "ml", "presencial"];

function num(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function numNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function emptyRules() {
  return {
    shopee: {
      taxa_pct: 0,
      taxa_fixa: 0,
      desconto_medio: 0,
      frete_seller: 0,
      preco_de_add: 0,
      margem_min_pct: 0,
    },
    ml: {
      taxa_pct: 0,
      taxa_fixa: 0,
      desconto_medio: 0,
      frete_seller: 0,
      preco_de_add: 0,
      margem_min_pct: 0,
    },
    presencial: {
      taxa_pct: 0,
      taxa_fixa: 0,
      desconto_medio: 0,
      frete_seller: 0,
      preco_de_add: 0,
      margem_min_pct: 0,
    },
  };
}

module.exports = {
  async getData() {
    const products = await this.listProducts();
    const pricesByProductId = await this.getPricesByProductId();
    const rules = await this.getRules();
    return { products, pricesByProductId, rules };
  },

  async listProducts() {
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
      custo: num(r.custo_medio, 0),
    }));
  },

  async getPricesByProductId() {
    const { rows } = await db.query(
      `
      select
        product_id,
        canal,
        preco_venda,
        preco_de
      from product_prices
      `
    );

    const map = {};
    for (const r of rows) {
      const pid = String(r.product_id);
      map[pid] ||= { shopee: null, ml: null, presencial: null };

      const canal = String(r.canal);
      if (!CANAIS.includes(canal)) continue;

      map[pid][canal] = {
        por: numNull(r.preco_venda),
        de: numNull(r.preco_de),
        // compat
        preco_venda: numNull(r.preco_venda),
        preco_de: numNull(r.preco_de),
      };
    }

    return map;
  },

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

    return base;
  },

  /**
   * updates: [{ productId, canal, price, priceDe }]
   * - price   -> preco_venda ("Por")
   * - priceDe -> preco_de   ("De" promo opcional)
   *
   * Regras IMPORTANTES:
   * - undefined = NÃO ALTERA o campo
   * - null      = LIMPA o campo (vira NULL no DB)
   * - delete row SOMENTE quando (price === null && priceDe === null)
   *
   * Isso evita sobrescrever um campo quando você editou só o outro.
   */
  async savePrices(updates) {
    const client = await db.getClient();

    try {
      await client.query("begin");

      const clean = (Array.isArray(updates) ? updates : [])
        .filter((u) => u && u.productId && CANAIS.includes(String(u.canal)))
        .map((u) => {
          // normaliza compat (aceita por/de também)
          const rawPrice =
            u.price !== undefined
              ? u.price
              : u.preco_venda !== undefined
              ? u.preco_venda
              : u.por !== undefined
              ? u.por
              : undefined;

          const rawPriceDe =
            u.priceDe !== undefined
              ? u.priceDe
              : u.preco_de !== undefined
              ? u.preco_de
              : u.de !== undefined
              ? u.de
              : undefined;

          // mantém undefined (não mexe), mantém null (limpa), número vira número
          const price =
            rawPrice === undefined ? undefined : rawPrice === null ? null : numNull(rawPrice);

          const priceDe =
            rawPriceDe === undefined ? undefined : rawPriceDe === null ? null : numNull(rawPriceDe);

          return {
            productId: String(u.productId),
            canal: String(u.canal),
            price,
            priceDe,
          };
        });

      if (!clean.length) {
        await client.query("commit");
        return;
      }

      for (const u of clean) {
        // delete só se AMBOS explicitamente null
        if (u.price === null && u.priceDe === null) {
          await client.query(
            `delete from product_prices where product_id = $1 and canal = $2`,
            [u.productId, u.canal]
          );
          continue;
        }

        // upsert com update parcial:
        // - se vier undefined, mantém o valor atual do banco (COALESCE(field, current))
        await client.query(
          `
          insert into product_prices (product_id, canal, preco_venda, preco_de, atualizado_em)
          values ($1, $2, $3, $4, now())
          on conflict (product_id, canal)
          do update set
            preco_venda = coalesce(excluded.preco_venda, product_prices.preco_venda),
            preco_de = coalesce(excluded.preco_de, product_prices.preco_de),
            atualizado_em = now()
          `,
          [
            u.productId,
            u.canal,
            u.price === undefined ? null : u.price,     // undefined -> NULL no excluded (não altera por COALESCE)
            u.priceDe === undefined ? null : u.priceDe, // undefined -> NULL no excluded (não altera por COALESCE)
          ]
        );

        // ATENÇÃO:
        // - se você quiser "limpar" um campo, mande null (isso vai virar NULL e COALESCE não vai manter)
        // Mas COALESCE manteria se excluded fosse NULL. Então, pra "limpar", precisamos diferenciar.
        // Solução: quando for null, fazemos update direto depois. (seguro e simples)
        if (u.price === null || u.priceDe === null) {
          const sets = [];
          const vals = [];
          let idx = 1;

          // product_id e canal no fim
          if (u.price === null) {
            sets.push(`preco_venda = NULL`);
          }
          if (u.priceDe === null) {
            sets.push(`preco_de = NULL`);
          }

          if (sets.length) {
            vals.push(u.productId);
            vals.push(u.canal);

            await client.query(
              `
              update product_prices
              set ${sets.join(", ")}, atualizado_em = now()
              where product_id = $1 and canal = $2
              `,
              vals
            );
          }
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

  async saveRules(rules) {
    const client = await db.getClient();
    try {
      await client.query("begin");

      for (const canal of CANAIS) {
        const r = rules?.[canal];
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
