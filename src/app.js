// src/app.js
"use strict";

const express = require("express");
const path = require("path");
const session = require("express-session");

const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const catalogoRoutes = require("./routes/catalogo.routes"); // ✅ NOVO

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1); // Render/Proxy

app.use(
  session({
    name: "vs_admin",
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 12, // 12h
    },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// estáticos
app.use(express.static(path.join(process.cwd(), "public")));

// ✅ catálogo público
app.use("/catalogo", catalogoRoutes);

// rotas públicas (home, etc.)
app.use("/", publicRoutes);

// rotas admin
app.use("/admin", adminRoutes);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ middleware de erro (pra parar de ficar “Internal Server Error” sem pista)
app.use((err, req, res, next) => {
  console.error("❌ ERRO:", err && err.stack ? err.stack : err);
  res.status(err.statusCode || 500).send("Internal Server Error");
});

module.exports = app;
