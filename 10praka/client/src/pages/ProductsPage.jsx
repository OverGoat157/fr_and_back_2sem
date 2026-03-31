import React, { useState, useEffect } from 'react';
import * as productsApi from '../api/products';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try { const res = await productsApi.getAll(); setProducts(res.data); } catch { setError('Ошибка загрузки'); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await productsApi.update(editId, { ...form, price: Number(form.price) });
        setEditId(null);
      } else {
        await productsApi.create({ ...form, price: Number(form.price) });
      }
      setForm({ title: '', category: '', description: '', price: '' });
      load();
    } catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ title: p.title, category: p.category, description: p.description, price: String(p.price) });
  };

  const handleDelete = async (id) => {
    try { await productsApi.remove(id); load(); } catch (err) { setError(err.response?.data?.error || 'Ошибка удаления'); }
  };

  const handleCancel = () => { setEditId(null); setForm({ title: '', category: '', description: '', price: '' }); };

  return (
    <div>
      <h2>Товары</h2>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <h3>{editId ? 'Редактировать товар' : 'Новый товар'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Название</label><input name="title" value={form.title} onChange={handleChange} required /></div>
          <div className="form-group"><label>Категория</label><input name="category" value={form.category} onChange={handleChange} required /></div>
          <div className="form-group"><label>Описание</label><input name="description" value={form.description} onChange={handleChange} /></div>
          <div className="form-group"><label>Цена</label><input name="price" type="number" value={form.price} onChange={handleChange} required /></div>
          <div className="actions">
            <button type="submit">{editId ? 'Сохранить' : 'Создать'}</button>
            {editId && <button type="button" onClick={handleCancel}>Отмена</button>}
          </div>
        </form>
      </div>
      {products.map(p => (
        <div className="card" key={p.id}>
          <h3>{p.title}</h3>
          <p>Категория: {p.category}</p>
          <p>{p.description}</p>
          <p><strong>{p.price} руб.</strong></p>
          <div className="actions">
            <button onClick={() => handleEdit(p)}>Редактировать</button>
            <button className="danger" onClick={() => handleDelete(p.id)}>Удалить</button>
          </div>
        </div>
      ))}
    </div>
  );
}
