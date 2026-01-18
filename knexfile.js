// knexfile.js
"use strict";

const DATABASE_URL = process.env.PG_DATABASE_URL || process.env.DATABASE_URL;

module.exports = {
  client: "pg",
  connection: DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" || process.env.RENDER
          ? { rejectUnauthorized: false }
          : undefined,
      }
    : {
        // fallback local (se você quiser usar .env depois)
        host: "127.0.0.1",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "vibesensual"
      },
  migrations: {
    directory: "./migrations"
  }
};
