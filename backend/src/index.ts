import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import http from "http";
import path from "path";
import multer from "multer";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { initSockets } from "./sockets";
import { authRouter } from "./routes/auth";
import { settingsRouter } from "./routes/settings";
import { guestsRouter } from "./routes/guests";
import { guestRequestsRouter } from "./routes/guestRequests";
import { photosRouter } from "./routes/photos";
import { wishesRouter } from "./routes/wishes";
import { hotelReservationsRouter } from "./routes/hotelReservations";
import { seedPhoneGuests } from "./seed/phoneGuests";

async function main() {
  await connectDb();
  await seedPhoneGuests();

  const app = express();
  app.use(cors({ origin: env.clientOrigin }));
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      },
    })
  );

  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/guests", guestsRouter);
  app.use("/api/guest-requests", guestRequestsRouter);
  app.use("/api/photos", photosRouter);
  app.use("/api/wishes", wishesRouter);
  app.use("/api/hotel-reservations", hotelReservationsRouter);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof multer.MulterError || err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  const server = http.createServer(app);
  initSockets(server);

  server.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port} (payment mode: ${env.paymentMode})`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
