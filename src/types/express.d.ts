import type { SessionPayload } from "../lib/session";

declare global {
  namespace Express {
    interface Locals {
      session: SessionPayload | null;
      user: import("../generated/prisma/models").UserModel | null;
    }
  }
}

export {};