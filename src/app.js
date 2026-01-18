// src/app.js
"use strict";

const express = require("express");
const path = require("path");

const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// estáticos
app.use(express.static(path.join(process.cwd(), "public")));

// rotas
app.use("/admin", adminRoutes);

// catálogo público (depois fazemos)
app.get("/", (req, res) => res.redirect("/catalogo"));

// health check (ajuda MUITO no Render)
app.get("/health", (req, res) => res.json({ ok: true }));

module.exports = app;
