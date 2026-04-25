import React, { useState } from 'react';

export default function LoginPage({ onLogin, error }) {
  const [email, setEmail] = useState('luiz@megan.local');
  const [password, setPassword] = useState('123456');
  const [busy, setBusy] = useState(false);

  async function submit() {
    try { setBusy(true); await onLogin(email, password); }
    finally { setBusy(false); }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>Megan V19</h1>
        <p>Cobrança recorrente, portal do cliente e histórico de pagamentos.</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" />
        <button onClick={submit} disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
        {error ? <div className="error">{error}</div> : null}
      </div>
    </div>
  );
}
