import { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export function useDashboardData() {
  const [envCheck, setEnvCheck] = useState(null);
  const [deployGuide, setDeployGuide] = useState(null);
  const [finalCheck, setFinalCheck] = useState(null);
  const [autoFix, setAutoFix] = useState(null);
  const [actionPriority, setActionPriority] = useState(null);
  const [safeAutoRun, setSafeAutoRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [envResponse, guideResponse, finalResponse, autoFixResponse, actionResponse, safeResponse] = await Promise.all([
          fetch(`${apiUrl}/api/env-check`),
          fetch(`${apiUrl}/api/deploy-guide`),
          fetch(`${apiUrl}/api/final-check`),
          fetch(`${apiUrl}/api/auto-fix`),
          fetch(`${apiUrl}/api/action-priority`),
          fetch(`${apiUrl}/api/safe-auto-run`),
        ]);
        setEnvCheck(await envResponse.json());
        setDeployGuide(await guideResponse.json());
        setFinalCheck(await finalResponse.json());
        setAutoFix(await autoFixResponse.json());
        setActionPriority(await actionResponse.json());
        setSafeAutoRun(await safeResponse.json());
      } catch (error) {
        console.error('Erro ao carregar Megan V18', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { envCheck, deployGuide, finalCheck, autoFix, actionPriority, safeAutoRun, loading };
}
