function notFoundHandler(req, res) {
  return res.status(404).json({
    ok: false,
    error: "Rota não encontrada."
  });
}

export { notFoundHandler };
