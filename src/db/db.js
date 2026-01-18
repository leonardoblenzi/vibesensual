// src/db/db.js
"use strict";

const { Pool } = require("pg");

// ✅ Render normalmente fornece DATABASE_URL automaticamente no serviço
// Se você preferir isolar, pode usar PG_DATABASE_URL (opcional)
const DATABASE_URL = process.env.PG_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL ausente. Configure no Render (Postgres) ou defina PG_DATABASE_URL.");
}

// Em alguns cenários (principalmente conexões externas), o Render exige SSL.
// O Render costuma funcionar com ssl: { rejectUnauthorized: false } em produção.
const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("PG Pool error:", err);
});

module.exports = {
  query(text, params) {
    return pool.query(text, params);
  },

  async getClient() {
    return pool.connect();
  },

  async ping() {
    const r = await pool.query("select now() as now");
    return r.rows?.[0]?.now || null;
  },
};
