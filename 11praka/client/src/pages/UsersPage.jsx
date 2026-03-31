import React, { useState, useEffect } from 'react';
import * as usersApi from '../api/users';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try { const res = await usersApi.getAll(); setUsers(res.data); } catch { setError('Ошибка загрузки'); }
  };

  useEffect(() => { load(); }, []);

  const handleToggleBlock = async (id) => {
    try { await usersApi.toggleBlock(id); load(); } catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
  };

  return (
    <div>
      <h2>Пользователи (админ)</h2>
      {error && <p className="error">{error}</p>}
      {users.map(u => (
        <div className="card" key={u.id} style={{ opacity: u.blocked ? 0.5 : 1 }}>
          <p><strong>{u.first_name} {u.last_name}</strong> ({u.email})</p>
          <p>Роль: {u.role} {u.blocked ? '| ЗАБЛОКИРОВАН' : ''}</p>
          <div className="actions">
            <button className={u.blocked ? '' : 'danger'} onClick={() => handleToggleBlock(u.id)}>
              {u.blocked ? 'Разблокировать' : 'Заблокировать'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
