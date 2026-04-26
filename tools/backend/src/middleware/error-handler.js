import { logError } from "../lib/logger.js";

function errorHandler(error, req, res, next) {
  logError("ERROR_HANDLER", error);
  return res.status(500).json({
    ok: false,
    error: error?.message || "Erro interno do servidor."
  });
}

export { errorHandler };
