// src/controllers/AdminAuthController.js
"use strict";

function viewLogin(req, res) {
  if (req.session?.isAdmin) return res.redirect("/admin");
  return res.render("admin/login", { error: null });
}

function doLogin(req, res) {
  const pass = String(req.body?.password || "");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return res.status(500).send("ADMIN_PASSWORD não configurada no ambiente.");
  }

  if (pass !== ADMIN_PASSWORD) {
    return res.status(401).render("admin/login", { error: "Senha inválida." });
  }

  req.session.isAdmin = true;
  return res.redirect("/admin");
}

function logout(req, res) {
  req.session.destroy(() => res.redirect("/admin/login"));
}

module.exports = {
  viewLogin,
  doLogin,
  logout,
};
