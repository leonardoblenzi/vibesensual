// src/services/CustomerService.js
"use strict";

const db = require("../db/db");

// Origem sugerida (não é obrigatório)
const ORIGENS = new Set(["shopee", "ml", "presencial", "instagram", "whatsapp", "outro"]);

function normEmail(email) {
  const s = String(email || "").trim().toLowerCase();
  return s || null;
}

function normPhone(phone) {
  const digits = String(phone || "").replace(/\D+/g, "");
  return digits ? digits : null;
}

/**
 * Política de update:
 * - Sempre que chegar um campo novo preenchido e o atual estiver vazio -> atualiza
 * - Se o atual estiver preenchido e o novo for diferente -> NÃO sobrescreve (MVP conservador)
 *   (Depois a gente pode adicionar "forceUpdate" ou "merge" com confirmação.)
 */
function pickUpdate(existing, incoming) {
  const patch = {};

  const fields = ["nome", "telefone", "telefone_norm", "email", "email_norm", "instagram", "origem"];
  for (const f of fields) {
    const cur = existing?.[f];
    const inc = incoming?.[f];

    if ((cur === null || cur === undefined || cur === "") && (inc !== null && inc !== undefined && inc !== "")) {
      patch[f] = inc;
    }
  }

  // tags/observacoes: não mexe automaticamente
  return patch;
}

module.exports = {
  normEmail,
  normPhone,

  /**
   * upsertFromContact({ nome, telefone, email, instagram, origem })
   * - Se tiver email -> tenta achar por email_norm
   * - Senão se tiver telefone -> tenta achar por telefone_norm
   * - Se achar -> atualiza campos vazios e retorna id
   * - Se não achar -> cria e retorna id
   * - Se não tiver email nem telefone -> retorna null (cliente opcional)
   */
  async upsertFromContact(input) {
    const nome = String(input?.nome || "").trim() || null;
    const telefone = String(input?.telefone || "").trim() || null;
    const email = String(input?.email || "").trim() || null;
    const instagram = String(input?.instagram || "").trim() || null;

    const email_norm = normEmail(email);
    const telefone_norm = normPhone(telefone);

    // cliente opcional: se não tiver contato, nem tenta
    if (!email_norm && !telefone_norm) return null;

    let origem = String(input?.origem || "").trim().toLowerCase() || null;
    if (origem && !ORIGENS.has(origem)) origem = "outro";

    const client = await db.getClient();
    try {
      await client.query("begin");

      // 1) Busca prioridade: email, depois telefone
      let existing = null;

      if (email_norm) {
        const r = await client.query(
          `select * from customers where email_norm = $1 limit 1`,
          [email_norm]
        );
        existing = r.rows[0] || null;
      }

      if (!existing && telefone_norm) {
        const r = await client.query(
          `select * from customers where telefone_norm = $1 limit 1`,
          [telefone_norm]
        );
        existing = r.rows[0] || null;
      }

      const incoming = {
        nome,
        telefone,
        telefone_norm,
        email,
        email_norm,
        instagram,
        origem,
      };

      // 2) Achou -> atualiza campos vazios (MVP conservador)
      if (existing) {
        const patch = pickUpdate(existing, incoming);
        const keys = Object.keys(patch);

        if (keys.length) {
          const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
          const vals = keys.map((k) => patch[k]);

          await client.query(
            `
            update customers
               set ${sets},
                   atualizado_em = now()
             where id = $${keys.length + 1}
            `,
            [...vals, existing.id]
          );
        } else {
          // só atualiza o updated_at se você quiser (eu deixei sem mexer)
          // await client.query(`update customers set atualizado_em = now() where id = $1`, [existing.id]);
        }

        await client.query("commit");
        return Number(existing.id);
      }

      // 3) Não achou -> cria
      // Observação: como temos unique parcial por email_norm/telefone_norm,
      // pode rolar corrida (duas vendas ao mesmo tempo). Então tentamos inserir
      // e, se der conflito, buscamos de novo.
      let insertedId = null;

      try {
        const ins = await client.query(
          `
          insert into customers
            (nome, telefone, telefone_norm, email, email_norm, instagram, origem, criado_em, atualizado_em)
          values
            ($1, $2, $3, $4, $5, $6, $7, now(), now())
          returning id
          `,
          [nome, telefone, telefone_norm, email, email_norm, instagram, origem]
        );
        insertedId = ins.rows?.[0]?.id ? Number(ins.rows[0].id) : null;
      } catch (e) {
        // possível conflito unique parcial
        // tenta buscar de novo (email > telefone)
        if (email_norm) {
          const r = await client.query(
            `select id from customers where email_norm = $1 limit 1`,
            [email_norm]
          );
          insertedId = r.rows?.[0]?.id ? Number(r.rows[0].id) : null;
        }
        if (!insertedId && telefone_norm) {
          const r = await client.query(
            `select id from customers where telefone_norm = $1 limit 1`,
            [telefone_norm]
          );
          insertedId = r.rows?.[0]?.id ? Number(r.rows[0].id) : null;
        }

        if (!insertedId) throw e;
      }

      await client.query("commit");
      return insertedId;
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  },

  /**
   * Busca simples pra autocomplete (depois pluga no front)
   * query: string
   */
  async search(query, limit = 10) {
    const q = String(query || "").trim();
    if (!q) return [];

    const qDigits = q.replace(/\D+/g, "");
    const like = `%${q.toLowerCase()}%`;

    const { rows } = await db.query(
      `
      select
        id, nome, telefone, email, instagram, origem, tags,
        criado_em, atualizado_em
      from customers
      where
        lower(coalesce(nome,'')) like $1
        or lower(coalesce(email,'')) like $1
        or lower(coalesce(instagram,'')) like $1
        ${qDigits ? "or telefone_norm like $2" : ""}
      order by atualizado_em desc
      limit ${Number(limit) || 10}
      `,
      qDigits ? [like, `%${qDigits}%`] : [like]
    );

    return rows.map((r) => ({
      id: Number(r.id),
      nome: r.nome,
      telefone: r.telefone,
      email: r.email,
      instagram: r.instagram,
      origem: r.origem,
      tags: r.tags,
      criado_em: r.criado_em,
      atualizado_em: r.atualizado_em,
    }));
  },

  async getById(id) {
    const { rows } = await db.query(
      `select * from customers where id = $1 limit 1`,
      [Number(id)]
    );
    return rows[0] || null;
  },
};
