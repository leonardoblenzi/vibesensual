"use strict";

const ProdutosExtrasService = require("../services/ProdutosExtrasService");

function safeMsg(e) {
  return (e && e.message) ? e.message : "Erro inesperado.";
}

module.exports = {
  // =========================
  // IMAGENS
  // =========================
  async imagesPage(req, res, next) {
    try {
      const productId = String(req.params.id || "");
      const product = await ProdutosExtrasService.getProductBasic(productId);
      if (!product) return res.status(404).send("Produto não encontrado.");

      const images = await ProdutosExtrasService.listImages(productId);

      res.render("admin/produtos-imagens", {
        product,
        images,
        error: null,
      });
    } catch (e) {
      next(e);
    }
  },

  async addImage(req, res) {
    const productId = String(req.params.id || "");
    try {
      await ProdutosExtrasService.addImage(productId, {
        url: req.body.url,
        alt: req.body.alt,
        ordem: req.body.ordem,
        is_cover: req.body.is_cover === "on",
      });
      return res.redirect(`/admin/produtos/${productId}/imagens`);
    } catch (e) {
      const product = await ProdutosExtrasService.getProductBasic(productId);
      const images = await ProdutosExtrasService.listImages(productId);
      return res.status(400).render("admin/produtos-imagens", {
        product,
        images,
        error: safeMsg(e),
      });
    }
  },

  async setCover(req, res, next) {
    try {
      const productId = String(req.params.id || "");
      const imageId = String(req.params.imageId || "");
      await ProdutosExtrasService.setCover(productId, imageId);
      return res.redirect(`/admin/produtos/${productId}/imagens`);
    } catch (e) {
      next(e);
    }
  },

  async deleteImage(req, res, next) {
    try {
      const productId = String(req.params.id || "");
      const imageId = String(req.params.imageId || "");
      await ProdutosExtrasService.deleteImage(productId, imageId);
      return res.redirect(`/admin/produtos/${productId}/imagens`);
    } catch (e) {
      next(e);
    }
  },

  // =========================
  // VARIAÇÕES
  // =========================
  async variantsPage(req, res, next) {
    try {
      const productId = String(req.params.id || "");
      const product = await ProdutosExtrasService.getProductBasic(productId);
      if (!product) return res.status(404).send("Produto não encontrado.");

      const variants = await ProdutosExtrasService.listVariants(productId);

      // payload pro JS (zero erro)
      const payload = encodeURIComponent(JSON.stringify({ variants }));

      res.render("admin/produtos-variacoes", {
        product,
        variants,
        payload,
        error: null,
      });
    } catch (e) {
      next(e);
    }
  },

  async addVariant(req, res) {
    const productId = String(req.params.id || "");
    try {
      await ProdutosExtrasService.addVariant(productId, req.body);
      return res.redirect(`/admin/produtos/${productId}/variacoes`);
    } catch (e) {
      const product = await ProdutosExtrasService.getProductBasic(productId);
      const variants = await ProdutosExtrasService.listVariants(productId);
      const payload = encodeURIComponent(JSON.stringify({ variants }));
      return res.status(400).render("admin/produtos-variacoes", {
        product,
        variants,
        payload,
        error: safeMsg(e),
      });
    }
  },

  async updateVariant(req, res) {
    const productId = String(req.params.id || "");
    const variantId = String(req.params.variantId || "");
    try {
      await ProdutosExtrasService.updateVariant(productId, variantId, req.body);
      return res.redirect(`/admin/produtos/${productId}/variacoes`);
    } catch (e) {
      const product = await ProdutosExtrasService.getProductBasic(productId);
      const variants = await ProdutosExtrasService.listVariants(productId);
      const payload = encodeURIComponent(JSON.stringify({ variants }));
      return res.status(400).render("admin/produtos-variacoes", {
        product,
        variants,
        payload,
        error: safeMsg(e),
      });
    }
  },

  async deleteVariant(req, res, next) {
    try {
      const productId = String(req.params.id || "");
      const variantId = String(req.params.variantId || "");
      await ProdutosExtrasService.deleteVariant(productId, variantId);
      return res.redirect(`/admin/produtos/${productId}/variacoes`);
    } catch (e) {
      next(e);
    }
  },
};
