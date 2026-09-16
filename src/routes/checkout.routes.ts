import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validatedOf } from "../middleware/validate";
import { z } from "zod";
import { getCheckoutPreview, getOrderTotals, type CartLine, type PreviewLine } from "../services/checkout.service";
import { placeOrder, type PlaceOrderInput } from "../services/order.service";

export const checkoutRouter = Router();

const previewSchema = z.object({
  items: z.array(z.object({ id: z.coerce.number().int().positive(), qty: z.coerce.number().int().min(1) })),
});

const totalsSchema = z.object({
  lines: z.array(z.object({ lineTotal: z.number(), price: z.number(), stock: z.number() }).passthrough()),
  zoneId: z.coerce.number().int().positive(),
  couponCode: z.string().optional().nullable(),
});

checkoutRouter.post("/preview", validateBody(previewSchema), async (_req, res) => {
  const { items } = validatedOf<{ items: CartLine[] }>(res);
  res.json(await getCheckoutPreview(items));
});

checkoutRouter.post("/totals", validateBody(totalsSchema), async (_req, res) => {
  const { lines, zoneId, couponCode } = validatedOf<{ lines: PreviewLine[]; zoneId: number; couponCode?: string | null }>(res);
  res.json(await getOrderTotals(lines, zoneId, couponCode));
});

checkoutRouter.post("/", requireAuth, async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const result = await placeOrder(userId, req.body as PlaceOrderInput);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.status(201).json(result);
});