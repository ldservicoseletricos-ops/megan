import { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export function useSystemData() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${apiUrl}/api/system`);
        const json = await response.json();
        setOverview(json.overview || null);
      } catch (error) {
        console.error('Erro ao carregar sistema', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { overview, loading };
}
