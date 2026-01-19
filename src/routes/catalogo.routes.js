"use strict";

const express = require("express");
const router = express.Router();

const CatalogoController = require("../controllers/CatalogoController");

router.get("/", CatalogoController.index);
router.get("/produto/:id", CatalogoController.product);

module.exports = router;
