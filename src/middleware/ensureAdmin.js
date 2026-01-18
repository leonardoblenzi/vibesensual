// src/middleware/ensureAdmin.js
"use strict";

module.exports = function ensureAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  return res.redirect("/admin/login");
};
