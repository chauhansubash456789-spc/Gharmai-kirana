import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(422).json({
        error: parsed.error.issues[0]?.message ?? "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    res.locals.validated = parsed.data;
    next();
  };
}

export function validatedOf<T>(res: Response): T {
  return res.locals.validated as T;
}