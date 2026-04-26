import { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export function useOperationsData() {
  const [overview, setOverview] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewResponse, routinesResponse, alertsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/operations`),
          fetch(`${apiUrl}/api/routines`),
          fetch(`${apiUrl}/api/alerts`),
        ]);

        const overviewJson = await overviewResponse.json();
        const routinesJson = await routinesResponse.json();
        const alertsJson = await alertsResponse.json();

        setOverview(overviewJson.overview || null);
        setRoutines(routinesJson.routines || []);
        setAlerts(alertsJson.alerts || []);
      } catch (error) {
        console.error('Erro ao carregar operação contínua', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { overview, routines, alerts, loading };
}
