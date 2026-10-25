import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes";
import { catalogRouter } from "./routes/catalog.routes";
import { addressRouter } from "./routes/address.routes";
import { wishlistRouter } from "./routes/wishlist.routes";
import { checkoutRouter } from "./routes/checkout.routes";
import { orderRouter } from "./routes/order.routes";
import { paymentRouter } from "./routes/payment.routes";
import { driverRouter } from "./routes/driver.routes";
import { adminRouter } from "./routes/admin.routes";
import { notFoundHandler, errorHandler } from "./middleware/error";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const configured = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? [];
      const devOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:8081",
        "http://10.0.2.2:8081",
        "http://10.0.2.2:4000",
      ];
      if (
        configured.includes(origin) ||
        devOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.")
      ) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "gharmai-kirana-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api", catalogRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/driver", driverRouter);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/admin", adminRouter);

const clientDist = path.resolve(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Gharmai Kirana API listening on http://localhost:${PORT}`);
});