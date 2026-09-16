import { Router } from "express";
import type { Response } from "express";
import { z } from "zod";
import { requireDriver } from "../middleware/auth";
import { validateBody, validatedOf } from "../middleware/validate";
import {
  driverAccept,
  driverComplete,
  driverFail,
  driverOutForDelivery,
  driverPickup,
  failReasons,
  getDriverHistory,
  getDriverOrders,
  getDriverStats,
  setDriverOnline,
  type DriverActionResult,
} from "../services/driver.service";

export const driverRouter = Router();

driverRouter.use(requireDriver);

driverRouter.get("/orders", async (_req, res) => {
  res.json(await getDriverOrders(Number(res.locals.session?.sub)));
});

driverRouter.get("/stats", async (_req, res) => {
  res.json(await getDriverStats(Number(res.locals.session?.sub)));
});

driverRouter.get("/history", async (req, res) => {
  const range = typeof req.query.range === "string" ? req.query.range : "today";
  res.json(await getDriverHistory(Number(res.locals.session?.sub), range));
});

driverRouter.get("/fail-reasons", (_req, res) => {
  res.json(failReasons());
});

driverRouter.post("/online", validateBody(z.object({ online: z.boolean() })), async (_req, res) => {
  const { online } = validatedOf<{ online: boolean }>(res);
  await setDriverOnline(Number(res.locals.session?.sub), online);
  res.json({ ok: true, online });
});

async function runAction(res: Response, action: Promise<DriverActionResult>) {
  const result = await action;
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
}

driverRouter.post("/orders/:id/accept", async (req, res) => {
  await runAction(res, driverAccept(Number(res.locals.session?.sub), Number(req.params.id)));
});

driverRouter.post("/orders/:id/pickup", async (req, res) => {
  await runAction(res, driverPickup(Number(res.locals.session?.sub), Number(req.params.id)));
});

driverRouter.post("/orders/:id/out-for-delivery", async (req, res) => {
  await runAction(res, driverOutForDelivery(Number(res.locals.session?.sub), Number(req.params.id)));
});

const completeSchema = z.object({
  otp: z.string().min(4, "Enter the 4-digit OTP"),
  notes: z.string().optional(),
  proofImage: z.string().optional(),
});

driverRouter.post("/orders/:id/complete", validateBody(completeSchema), async (req, res) => {
  const { otp, notes, proofImage } = validatedOf<{ otp: string; notes?: string; proofImage?: string }>(res);
  await runAction(res, driverComplete(Number(res.locals.session?.sub), Number(req.params.id), otp, proofImage, notes));
});

driverRouter.post("/orders/:id/fail", validateBody(z.object({ reason: z.string().min(1) })), async (req, res) => {
  const { reason } = validatedOf<{ reason: string }>(res);
  await runAction(res, driverFail(Number(res.locals.session?.sub), Number(req.params.id), reason));
});
