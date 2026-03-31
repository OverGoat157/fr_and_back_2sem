import React, { useState } from 'react';
import { register as registerApi, login as loginApi, getMe } from '../api/auth';

export default function RegisterPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'user' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerApi(form);
      const res = await loginApi({ email: form.email, password: form.password });
      const tokens = res.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      const meRes = await getMe();
      onLogin(meRes.data, tokens);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Email</label><input name="email" value={form.email} onChange={handleChange} /></div>
        <div className="form-group"><label>Имя</label><input name="first_name" value={form.first_name} onChange={handleChange} /></div>
        <div className="form-group"><label>Фамилия</label><input name="last_name" value={form.last_name} onChange={handleChange} /></div>
        <div className="form-group"><label>Пароль</label><input type="password" name="password" value={form.password} onChange={handleChange} /></div>
        <div className="form-group">
          <label>Роль</label>
          <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="user">Пользователь</option>
            <option value="seller">Продавец</option>
          </select>
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}
