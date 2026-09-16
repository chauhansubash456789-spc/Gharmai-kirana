import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { toggleWishlist, getWishlistProducts } from "../services/wishlist.service";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get("/", async (_req, res) => {
  const userId = Number(res.locals.session?.sub);
  res.json(await getWishlistProducts(userId));
});

wishlistRouter.post("/toggle", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const productId = Number(req.body?.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    res.status(422).json({ error: "Invalid product." });
    return;
  }
  const result = await toggleWishlist(userId, productId);
  res.json(result);
});