"use strict";

const express = require("express");
const router = express.Router();

const CategoriasController = require("../controllers/CategoriasController");

router.get("/", CategoriasController.index);
router.post("/", CategoriasController.create);
router.post("/:id", CategoriasController.update);
router.post("/:id/delete", CategoriasController.remove);

module.exports = router;
