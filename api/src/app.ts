import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.ts";
import { requestLogger } from "./middleware/logger.ts";
import { attachUser } from "./middleware/authenticate.ts";
import { audit } from "./middleware/audit.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { notFound } from "./middleware/not-found.ts";
import eligibilityRoutes from "./routes/eligibility.routes.ts";
import papersRoutes from "./routes/papers.routes.ts";
import authRoutes from "./routes/auth.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";

const app = express();

// --- Security & platform middleware (order matters) ---
app.disable("x-powered-by");
app.use(helmet()); // secure HTTP headers (CSP, HSTS, noSniff, frameguard, ...)
app.use(cors({ origin: env.corsOrigins, credentials: true })); // origin allowlist
app.use(express.json({ limit: "100kb" })); // cap body size to blunt payload abuse
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(requestLogger); // request id + sanitized access log
app.use(attachUser); // soft-auth: populate req.user if a valid token is present
app.use(audit); // append-only audit trail for every request

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api", eligibilityRoutes);
app.use("/api", papersRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 + error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
