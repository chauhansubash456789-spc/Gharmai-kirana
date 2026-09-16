import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validatedOf } from "../middleware/validate";
import { addressSchema } from "../validations/address";
import { listAddressesForUser, addAddress, deleteAddress, setDefaultAddress, type AddressInput } from "../services/address.service";

export const addressRouter = Router();

addressRouter.use(requireAuth);

addressRouter.get("/", async (_req, res) => {
  const userId = Number(res.locals.session?.sub);
  res.json(await listAddressesForUser(userId));
});

addressRouter.post("/", validateBody(addressSchema), async (_req, res) => {
  const userId = Number(res.locals.session?.sub);
  const input = validatedOf<AddressInput>(res);
  const result = await addAddress(userId, input);
  if (result && "error" in result) {
    res.status(422).json(result);
    return;
  }
  res.status(201).json(await listAddressesForUser(userId));
});

addressRouter.post("/:id/default", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  await setDefaultAddress(userId, Number(req.params.id));
  res.json(await listAddressesForUser(userId));
});

addressRouter.delete("/:id", async (req, res) => {
  const userId = Number(res.locals.session?.sub);
  await deleteAddress(userId, Number(req.params.id));
  res.json(await listAddressesForUser(userId));
});