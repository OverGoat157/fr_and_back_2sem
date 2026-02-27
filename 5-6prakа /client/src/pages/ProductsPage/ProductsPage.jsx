import React, { useEffect, useState } from 'react'
import './ProductsPage.scss'
import ProductsList from '../../components/ProductsList'
import ProductModal from '../../components/ProductModal'
import { api } from '../../api'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Все')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await api.getProducts()
      setProducts(data)
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setModalMode('create')
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setModalMode('edit')
    setEditingProduct(product)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return
    try {
      await api.deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      alert('Ошибка удаления товара')
    }
  }

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        const newProduct = await api.createProduct(payload)
        setProducts((prev) => [...prev, newProduct])
      } else {
        const updated = await api.updateProduct(payload.id, payload)
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.id ? updated : p))
        )
      }
      closeModal()
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения товара')
    }
  }

  const categories = ['Все', ...new Set(products.map((p) => p.category))]

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    const matchesCategory =
      categoryFilter === 'Все' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">⚡ Tech Shop</div>
          <div className="header__right">React + Express</div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Каталог товаров</h1>
            <button className="btn btn--primary" onClick={openCreate}>
              + Добавить товар
            </button>
          </div>

          <div className="filters">
            <input
              className="searchInput"
              type="text"
              placeholder="Поиск по названию, описанию или категории..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="categoryTabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`categoryTab${categoryFilter === c ? ' categoryTab--active' : ''}`}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : (
            <>
              <div className="resultsCount">
                Найдено: {filtered.length} товар(ов)
              </div>
              <ProductsList
                products={filtered}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Tech Shop
        </div>
      </footer>

      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  )
}
