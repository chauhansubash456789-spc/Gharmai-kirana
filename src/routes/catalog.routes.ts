import { Router } from "express";
import {
  getHomeSections,
  searchProducts,
  getCategoryWithProducts,
  getAllCategories,
  getCategoryBySlug,
} from "../services/catalog.service";
import { getProductBySlug } from "../services/product.service";
import { listZones } from "../services/zone.service";
import { getAllStoreSettings } from "../services/setting.service";

export const catalogRouter = Router();

catalogRouter.get("/home", async (_req, res) => {
  res.json(await getHomeSections());
});

catalogRouter.get("/products", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const dealsOnly = req.query.deals === "1" || req.query.deals === "true";
  res.json(await searchProducts(q, dealsOnly));
});

catalogRouter.get("/products/:slug", async (req, res) => {
  const product = await getProductBySlug(req.params.slug);
  if (!product || !product.active) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  res.json(product);
});

catalogRouter.get("/categories", async (_req, res) => {
  res.json(await getAllCategories());
});

catalogRouter.get("/categories/:slug", async (req, res) => {
  const { category, products } = await getCategoryWithProducts(req.params.slug);
  if (!category) {
    res.status(404).json({ error: "Category not found." });
    return;
  }
  res.json({ category, products });
});

catalogRouter.get("/category-exists/:slug", async (req, res) => {
  res.json({ exists: (await getCategoryBySlug(req.params.slug)) != null });
});

catalogRouter.get("/zones", async (_req, res) => {
  res.json(await listZones());
});

catalogRouter.get("/config", async (_req, res) => {
  res.json(await getAllStoreSettings());
});

catalogRouter.get("/settings", async (_req, res) => {
  res.json(await getAllStoreSettings());
});