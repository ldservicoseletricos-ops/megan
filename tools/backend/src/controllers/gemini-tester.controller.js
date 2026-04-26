
function nowIso() {
  return new Date().toISOString();
}

function getModelCandidates() {
  const explicit = String(process.env.GEMINI_MODEL || '').trim();
  const candidates = [
    explicit,
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean);

  return [...new Set(candidates)];
}

async function testGeminiModel(apiKey, model) {
  const startedAt = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Responda apenas: OK' }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 20
      }
    })
  });

  const elapsedMs = Date.now() - startedAt;
  const rawText = await response.text();

  if (!response.ok) {
    return {
      model,
      ok: false,
      status: response.status,
      elapsedMs,
      error: rawText
    };
  }

  let parsed = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = { raw: rawText };
  }

  const answer =
    parsed?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join('')
      .trim() || '';

  return {
    model,
    ok: true,
    status: response.status,
    elapsedMs,
    answer: answer || 'Sem texto'
  };
}

export async function getGeminiTesterOverviewController(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const configuredModel = process.env.GEMINI_MODEL || '';
    const models = getModelCandidates();

    const result = {
      ok: true,
      version: 'GEMINI-TESTER-FINAL',
      generatedAt: nowIso(),
      env: {
        hasApiKey: !!apiKey,
        configuredModel: configuredModel || '--',
        keyPreview: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : '--'
      },
      models,
      tests: [],
      bestModel: null,
      summary: apiKey
        ? 'Pronto para testar a API Gemini.'
        : 'GEMINI_API_KEY ausente no ambiente.'
    };

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Falha ao montar overview do testador Gemini'
    });
  }
}

export async function runGeminiTesterController(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const configuredModel = process.env.GEMINI_MODEL || '';
    const models = getModelCandidates();

    if (!apiKey) {
      return res.json({
        ok: true,
        version: 'GEMINI-TESTER-FINAL',
        generatedAt: nowIso(),
        env: {
          hasApiKey: false,
          configuredModel: configuredModel || '--',
          keyPreview: '--'
        },
        tests: [],
        bestModel: null,
        summary: 'GEMINI_API_KEY ausente no ambiente.'
      });
    }

    const tests = [];
    for (const model of models) {
      try {
        const test = await testGeminiModel(apiKey, model);
        tests.push(test);
      } catch (error) {
        tests.push({
          model,
          ok: false,
          status: 0,
          elapsedMs: 0,
          error: error?.message || 'Falha desconhecida'
        });
      }
    }

    const bestModel = tests.find((item) => item.ok)?.model || null;
    const summary = bestModel
      ? `Modelo funcionando encontrado: ${bestModel}`
      : 'Nenhum modelo respondeu com sucesso. Veja o erro real em cada teste.';

    return res.json({
      ok: true,
      version: 'GEMINI-TESTER-FINAL',
      generatedAt: nowIso(),
      env: {
        hasApiKey: true,
        configuredModel: configuredModel || '--',
        keyPreview: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
      },
      tests,
      bestModel,
      summary
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Falha ao executar testes Gemini'
    });
  }
}
