import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listOrdersForUser, getOrderForUser, deleteOrderForUser } from "../services/order.service";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.get("/", async (_req, res) => {
  const userId = Number(res.locals.session?.sub);
  res.json(await listOrdersForUser(userId));
});

orderRouter.get("/:id", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const order = await getOrderForUser(userId, Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  res.json(order);
});

orderRouter.delete("/:id", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const orderId = Number(req.params.id);
  const result = await deleteOrderForUser(userId, orderId);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});