import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { initiateEsewaPayment, verifyEsewaPayment } from "../services/payment.service";

export const paymentRouter = Router();

const MERCHANT_QR_PAYLOAD =
  process.env.MERCHANT_QR_PAYLOAD?.trim() ||
  "0002010102110216427142001754666826350011fonepay.com071622220200175466605204533153035245802NP5917Afno Kirana Pasal6010Birgunj MP6211070717999876304c307";
const MERCHANT_QR_NAME = process.env.MERCHANT_QR_NAME?.trim() || "Afno Kirana Pasal";
const MERCHANT_TERMINAL = "2222020017546660";
const MERCHANT_ADDRESS = "Birgunj MP";

paymentRouter.get("/merchant-qr", (_req, res) => {
  res.json({
    merchantName: MERCHANT_QR_NAME,
    terminalId: MERCHANT_TERMINAL,
    address: MERCHANT_ADDRESS,
    qrPayload: MERCHANT_QR_PAYLOAD,
    imageUrl: "/uploads/merchant_qr.png",
  });
});

paymentRouter.use(requireAuth);

paymentRouter.post("/submit-reference", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const orderId = Number(req.body?.orderId);
  const paymentRef = typeof req.body?.paymentRef === "string" ? req.body.paymentRef.trim() : "";
  const paymentMethod = typeof req.body?.paymentMethod === "string" ? req.body.paymentMethod : undefined;

  if (!Number.isInteger(orderId) || orderId <= 0 || !paymentRef) {
    res.status(400).json({ error: "Valid orderId and payment reference are required." });
    return;
  }

  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentRef,
      paymentStatus: "paid",
      ...(paymentMethod ? { paymentMethod } : {}),
    },
    include: { items: true },
  });

  res.json({ ok: true, order: updated });
});

paymentRouter.post("/esewa/initiate", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const orderId = Number(req.body?.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ error: "Valid orderId is required." });
    return;
  }
  const result = await initiateEsewaPayment(userId, orderId);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

paymentRouter.post("/esewa/verify", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  const orderId = Number(req.body?.orderId);
  const data = req.body?.data;
  if (!Number.isInteger(orderId) || orderId <= 0 || typeof data !== "string" || !data) {
    res.status(400).json({ error: "orderId and data are required." });
    return;
  }
  const result = await verifyEsewaPayment(userId, orderId, data);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});
