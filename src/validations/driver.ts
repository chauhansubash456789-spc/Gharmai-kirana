import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(2, "Enter the driver's full name"),
  phone: z.string().regex(/^9\d{9}$/, "Enter a valid 10-digit mobile number (e.g. 98XXXXXXXX)"),
  email: z.union([z.string().email("Enter a valid email address"), z.literal("")]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  vehicleType: z.string().max(30).optional(),
});

export type DriverInput = z.infer<typeof driverSchema>;