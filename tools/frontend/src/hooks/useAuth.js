import { useEffect, useState } from 'react';
import {
  clearStoredSession,
  getSession,
  getStoredToken,
  getStoredUser,
  login as loginApi,
  logout as logoutApi,
} from '../lib/authApi';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => getStoredUser());
  const [error, setError] = useState('');

  async function refresh() {
    const token = getStoredToken();
    const cachedUser = getStoredUser();

    if (!token) {
      clearStoredSession();
      setUser(null);
      setLoading(false);
      return;
    }

    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      setLoading(true);
      const session = await getSession();
      setUser(session?.user || null);
      setError('');
    } catch (error) {
      clearStoredSession();
      setUser(null);
      setError(error.message || 'Sessão expirada. Faça login novamente.');
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
      clearStoredSession();
      setUser(null);
      setError(error.message || 'Não foi possível entrar.');
      throw error;
    }
  }

  async function logout() {
    await logoutApi();
    setUser(null);
    setError('');
  }

  return { loading, user, error, login, logout, refresh };
}
