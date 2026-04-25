import { useEffect, useState } from 'react';
import { getSession, login as loginApi, logout as logoutApi } from '../lib/authApi';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      setLoading(true);
      const session = await getSession();
      setUser(session.user);
      setError('');
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(email, password) {
    try {
      const result = await loginApi(email, password);
      setUser(result.user);
      setError('');
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  async function logout() {
    await logoutApi();
    setUser(null);
  }

  return { loading, user, error, login, logout, refresh };
}
