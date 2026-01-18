"use strict";

const express = require("express");
const router = express.Router();

const ProdutosController = require("../controllers/ProdutosController");

router.get("/", ProdutosController.index);
router.post("/", ProdutosController.create);
router.post("/:id", ProdutosController.update);
router.post("/:id/delete", ProdutosController.remove);

module.exports = router;
