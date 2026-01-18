// src/app.js
"use strict";

const express = require("express");
const path = require("path");
const session = require("express-session");

const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");

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
      maxAge: 1000 * 60 * 60 * 12 // 12h
    }
  })
);


app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// estáticos
app.use(express.static(path.join(process.cwd(), "public")));

// rotas públicas (catálogo, etc.)
app.use("/", publicRoutes);
// src/app.js
app.use("/catalogo", require("./routes/catalogo.routes"));



// rotas admin
app.use("/admin", adminRoutes);

// health check (ajuda MUITO no Render)
app.get("/health", (req, res) => res.json({ ok: true }));

module.exports = app;
