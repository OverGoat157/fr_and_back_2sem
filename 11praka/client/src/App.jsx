import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import { getMe } from './api/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getMe().then(res => setUser(res.data)).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const handleLogin = (userData, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    setUser(userData);
    navigate('/products');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <nav>
        {user ? (
          <>
            <span>{user.first_name} ({user.role})</span>
            <Link to="/products">Товары</Link>
            {user.role === 'admin' && <Link to="/users">Пользователи</Link>}
            <button onClick={handleLogout} style={{ padding: '4px 8px', fontSize: '14px' }}>Выйти</button>
          </>
        ) : (
          <><Link to="/login">Войти</Link><Link to="/register">Регистрация</Link></>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/products" />} />
        <Route path="/register" element={!user ? <RegisterPage onLogin={handleLogin} /> : <Navigate to="/products" />} />
        <Route path="/products" element={user ? <ProductsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/users" element={user?.role === 'admin' ? <UsersPage /> : <Navigate to="/products" />} />
        <Route path="*" element={<Navigate to={user ? '/products' : '/login'} />} />
      </Routes>
    </>
  );
}
