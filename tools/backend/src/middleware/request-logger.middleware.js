import { appendOperationalEvent } from "../services/maintenance.service.js";
import { registerRouteMetric, registerFaultIfNeeded } from "../services/fault-management.service.js";

export function requestLoggerMiddleware(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const payload = {
      route: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      requestId: req.requestId
    };

    appendOperationalEvent({
      type: "request",
      ...payload
    });

    registerRouteMetric(payload);
    registerFaultIfNeeded(payload);
  });

  next();
}
