import { appendOperationalEvent } from "../services/maintenance.service.js";
import { createIncidentFromError } from "../services/fault-management.service.js";

export function errorHandlerMiddleware(error, req, res, next) {
  appendOperationalEvent({
    type: "error",
    route: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
    message: error?.message || "internal_error"
  });

  createIncidentFromError({
    category: "route_error",
    severity: "high",
    route: req.originalUrl,
    method: req.method,
    module: error?.module || "http_layer",
    requestId: req.requestId,
    message: error?.message || "internal_error",
    impact: "contained",
    actionTaken: "error_handler_response"
  });

  return res.status(error?.status || 500).json({
    ok: false,
    error: error?.message || "internal_error",
    requestId: req.requestId
  });
}
