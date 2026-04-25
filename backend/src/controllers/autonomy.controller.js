import {
  getRuntimeCompositeState,
  getRuntimeSchedulerState,
  runSchedulerCycle,
  startRuntimeScheduler,
  stopRuntimeScheduler
} from '../services/runtime.scheduler.service.js';
import {
  getFounderModeState,
  setFounderModeEnabled,
  runFounderMode
} from '../services/founder-ai-mode.service.js';
import {
  getRevenueEngineState,
  setRevenueEngineEnabled,
  runRevenueEngine
} from '../services/revenue-engine.service.js';
import {
  getSelfExpansionState,
  setSelfExpansionEnabled,
  runSelfExpansionCycle
} from '../services/self-expansion-engine.service.js';

export function getAutonomyOverviewController(req, res) {
  try {
    const composite = getRuntimeCompositeState();
    return res.json({
      ok: true,
      version: '10.0.0',
      runtime: composite,
      summary: {
        founderStage: composite.founder.stage,
        revenueScore: composite.revenue.revenueScore,
        expansionStage: composite.expansion.stage,
        expansionScore: composite.expansion.expansionScore,
        schedulerRunning: composite.scheduler.isRunning
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no overview de autonomia' });
  }
}

export function runAutonomyPulseController(req, res) {
  try {
    const mission = req.body?.mission || 'expandir megan com segurança';
    const result = runSchedulerCycle({ mission });
    return res.json({ ok: true, message: 'Pulso de expansão executado', ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no pulso autônomo' });
  }
}

export function toggleAutonomyController(req, res) {
  try {
    const enabled = req.body?.enabled !== false;
    const founder = setFounderModeEnabled(enabled);
    const revenue = setRevenueEngineEnabled(enabled);
    const expansion = setSelfExpansionEnabled(enabled);
    return res.json({ ok: true, enabled, founder, revenue, expansion });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar autonomia' });
  }
}

export function getFounderController(req, res) {
  try {
    return res.json({ ok: true, state: getFounderModeState() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao ler founder mode' });
  }
}

export function toggleFounderController(req, res) {
  try {
    return res.json({ ok: true, state: setFounderModeEnabled(req.body?.enabled !== false) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar founder mode' });
  }
}

export function runFounderController(req, res) {
  try {
    return res.json({ ok: true, ...runFounderMode(req.body || {}) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar founder mode' });
  }
}

export function getRevenueController(req, res) {
  try {
    return res.json({ ok: true, state: getRevenueEngineState() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao ler revenue engine' });
  }
}

export function toggleRevenueController(req, res) {
  try {
    return res.json({ ok: true, state: setRevenueEngineEnabled(req.body?.enabled !== false) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar revenue engine' });
  }
}

export function runRevenueController(req, res) {
  try {
    return res.json({ ok: true, ...runRevenueEngine(req.body || {}) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar revenue engine' });
  }
}

export function getExpansionController(req, res) {
  try {
    return res.json({ ok: true, state: getSelfExpansionState() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao ler expansion engine' });
  }
}

export function toggleExpansionController(req, res) {
  try {
    return res.json({ ok: true, state: setSelfExpansionEnabled(req.body?.enabled !== false) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar expansion engine' });
  }
}

export function runExpansionController(req, res) {
  try {
    return res.json({ ok: true, ...runSelfExpansionCycle(req.body || {}) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar expansion engine' });
  }
}

export function getSchedulerController(req, res) {
  try {
    return res.json({ ok: true, state: getRuntimeSchedulerState() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao ler scheduler' });
  }
}

export function startSchedulerController(req, res) {
  try {
    return res.json({ ok: true, state: startRuntimeScheduler(req.body || {}) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao iniciar scheduler' });
  }
}

export function stopSchedulerController(req, res) {
  try {
    return res.json({ ok: true, state: stopRuntimeScheduler() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao parar scheduler' });
  }
}
