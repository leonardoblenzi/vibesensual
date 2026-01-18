// src/routes/catalogo.routes.js
"use strict";

const express = require("express");
const router = express.Router();

const CatalogoController = require("../controllers/CatalogoController");

router.get("/", CatalogoController.index);

module.exports = router;
