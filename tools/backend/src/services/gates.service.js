
function evaluatePatchRequest(body) {
  const required = ['relativePath', 'findText', 'replaceText'];
  const missing = required.filter((k) => !body || typeof body[k] !== 'string' || !body[k].trim());

  if (missing.length) return { approved: false, reason: `Campos obrigatórios ausentes: ${missing.join(', ')}` };
  if (body.findText === body.replaceText) return { approved: false, reason: 'Patch rejeitado: conteúdo antigo e novo são idênticos.' };
  if (body.replaceText.length > 50000) return { approved: false, reason: 'Patch rejeitado: conteúdo novo grande demais.' };

  return { approved: true, reason: 'Patch autorizado para prévia/aplicação controlada.' };
}

module.exports = { evaluatePatchRequest };
