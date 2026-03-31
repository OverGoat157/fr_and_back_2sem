import React, { useState, useEffect } from 'react';
import * as productsApi from '../api/products';

export default function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const canCreate = ['seller', 'admin'].includes(user?.role);
  const canEdit = ['seller', 'admin'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const load = async () => { try { setProducts((await productsApi.getAll()).data); } catch { setError('Ошибка загрузки'); } };
  useEffect(() => { load(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editId) { await productsApi.update(editId, { ...form, price: Number(form.price) }); setEditId(null); }
      else { await productsApi.create({ ...form, price: Number(form.price) }); }
      setForm({ title: '', category: '', description: '', price: '' }); load();
    } catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
  };

  return (
    <div>
      <h2>Товары</h2>
      {error && <p className="error">{error}</p>}
      {canCreate && (
        <div className="card">
          <h3>{editId ? 'Редактировать' : 'Новый товар'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Название</label><input name="title" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group"><label>Категория</label><input name="category" value={form.category} onChange={handleChange} required /></div>
            <div className="form-group"><label>Описание</label><input name="description" value={form.description} onChange={handleChange} /></div>
            <div className="form-group"><label>Цена</label><input name="price" type="number" value={form.price} onChange={handleChange} required /></div>
            <div className="actions">
              <button type="submit">{editId ? 'Сохранить' : 'Создать'}</button>
              {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: '', category: '', description: '', price: '' }); }}>Отмена</button>}
            </div>
          </form>
        </div>
      )}
      {products.map(p => (
        <div className="card" key={p.id}>
          <h3>{p.title}</h3><p>Категория: {p.category}</p><p>{p.description}</p><p><strong>{p.price} руб.</strong></p>
          <div className="actions">
            {canEdit && <button onClick={() => { setEditId(p.id); setForm({ title: p.title, category: p.category, description: p.description, price: String(p.price) }); }}>Редактировать</button>}
            {canDelete && <button className="danger" onClick={async () => { try { await productsApi.remove(p.id); load(); } catch {} }}>Удалить</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
