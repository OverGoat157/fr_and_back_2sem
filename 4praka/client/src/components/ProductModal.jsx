import React, { useEffect, useState } from 'react'

const PREDEFINED_CATEGORIES = [
  'Ноутбуки',
  'Смартфоны',
  'Аудио',
  'Мониторы',
  'Периферия',
  'Планшеты',
  'Накопители',
  'Комплектующие',
  'Умный дом',
  'Носимые устройства',
  'Сети',
]

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [rating, setRating] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initialProduct?.name ?? '')
    setCategory(initialProduct?.category ?? '')
    setDescription(initialProduct?.description ?? '')
    setPrice(initialProduct?.price != null ? String(initialProduct.price) : '')
    setStock(initialProduct?.stock != null ? String(initialProduct.stock) : '')
    setRating(initialProduct?.rating != null ? String(initialProduct.rating) : '')
  }, [open, initialProduct])

  if (!open) return null

  const title = mode === 'edit' ? 'Редактирование товара' : 'Добавление товара'

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedCategory = category.trim()
    const trimmedDescription = description.trim()
    const parsedPrice = Number(price)
    const parsedStock = Number(stock)
    const parsedRating = rating.trim() !== '' ? Number(rating) : null

    if (!trimmedName) { alert('Введите название'); return }
    if (!trimmedCategory) { alert('Введите категорию'); return }
    if (!trimmedDescription) { alert('Введите описание'); return }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('Введите корректную цену (число ≥ 0)')
      return
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      alert('Введите корректное количество на складе (целое число ≥ 0)')
      return
    }
    if (parsedRating !== null && (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5)) {
      alert('Рейтинг должен быть числом от 0 до 5')
      return
    }

    onSubmit({
      id: initialProduct?.id,
      name: trimmedName,
      category: trimmedCategory,
      description: trimmedDescription,
      price: parsedPrice,
      stock: parsedStock,
      rating: parsedRating,
    })
  }

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Ноутбук ASUS VivoBook"
              autoFocus
            />
          </label>

          <label className="label">
            Категория
            <input
              className="input"
              list="categories-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Выберите или введите категорию"
            />
            <datalist id="categories-list">
              {PREDEFINED_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label className="label">
            Описание
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание товара"
              rows={3}
            />
          </label>

          <div className="formRow">
            <label className="label">
              Цена (₽)
              <input
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Например, 9990"
                inputMode="decimal"
              />
            </label>
            <label className="label">
              На складе (шт.)
              <input
                className="input"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Например, 10"
                inputMode="numeric"
              />
            </label>
          </div>

          <label className="label">
            Рейтинг (0–5, необязательно)
            <input
              className="input"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Например, 4.7"
              inputMode="decimal"
            />
          </label>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === 'edit' ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
