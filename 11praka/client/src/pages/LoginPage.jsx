import React, { useState } from 'react';
import { login as loginApi, getMe } from '../api/auth';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await loginApi({ email, password });
      const tokens = res.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      const meRes = await getMe();
      onLogin(meRes.data, tokens);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="form-group"><label>Пароль</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
