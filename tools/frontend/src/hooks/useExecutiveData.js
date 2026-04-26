import { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export function useExecutiveData() {
  const [overview, setOverview] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewResponse, decisionsResponse, tasksResponse] = await Promise.all([
          fetch(`${apiUrl}/api/system`),
          fetch(`${apiUrl}/api/decisions`),
          fetch(`${apiUrl}/api/tasks`),
        ]);

        const overviewJson = await overviewResponse.json();
        const decisionsJson = await decisionsResponse.json();
        const tasksJson = await tasksResponse.json();

        setOverview(overviewJson.overview || null);
        setDecisions(decisionsJson.decisions || []);
        setTasks(tasksJson.tasks || []);
      } catch (error) {
        console.error('Erro ao carregar painel executivo', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { overview, decisions, tasks, loading };
}
