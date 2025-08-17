// src/LoginPage.tsx
import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ token });
    } catch {
      notify('🛑 Invalid admin token.', { type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #22223b, #4a4e69 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: 36,
          borderRadius: 16,
          minWidth: 340,
          boxShadow: '0 6px 36px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.17)'
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 10, textAlign: 'center', color: '#333' }}>
          Admin Login
        </h2>
        <p style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 0 }}>
          Enter your admin token to access the dashboard.
        </p>
        <input
          type="password"
          autoFocus
          required
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Admin Token"
          style={{
            width: '100%',
            padding: '10px 14px',
            margin: '18px 0 14px 0',
            borderRadius: 8,
            border: '1.5px solid #999',
            fontSize: 17
          }}
        />
        <button
          type="submit"
          disabled={!token || loading}
          style={{
            width: '100%',
            padding: '11px',
            background: '#22223b',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '1px',
            fontSize: 17
          }}
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
