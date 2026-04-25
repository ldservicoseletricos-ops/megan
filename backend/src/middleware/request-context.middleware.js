export function requestContextMiddleware(req, res, next) {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  req.requestStartedAt = Date.now();
  next();
}
