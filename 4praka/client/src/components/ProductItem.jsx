import React from 'react'

const CATEGORY_ICONS = {
  'Ноутбуки': '💻',
  'Смартфоны': '📱',
  'Аудио': '🎧',
  'Мониторы': '🖥️',
  'Периферия': '⌨️',
  'Планшеты': '📟',
  'Накопители': '💾',
  'Комплектующие': '⚙️',
  'Умный дом': '🏠',
  'Носимые устройства': '⌚',
  'Сети': '📡',
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)
  return (
    <span className="starRating">
      {'★'.repeat(full)}
      {hasHalf ? '½' : ''}
      {'☆'.repeat(empty)}
      <span className="ratingValue">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function ProductItem({ product, onEdit, onDelete }) {
  const icon = CATEGORY_ICONS[product.category] || '📦'
  const stockClass =
    product.stock === 0 ? 'outOfStock' : product.stock <= 5 ? 'lowStock' : 'inStock'

  return (
    <div className="productCard">
      <div className="productCard__icon">{icon}</div>
      <div className="productCard__body">
        <div className="productCard__top">
          <span className="productCategory">{product.category}</span>
          <span className="productId">#{product.id}</span>
        </div>
        <div className="productName">{product.name}</div>
        <div className="productDesc">{product.description}</div>
        <div className="productMeta">
          <span className="productPrice">
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          <span className={`productStock ${stockClass}`}>
            {product.stock === 0
              ? 'Нет в наличии'
              : `На складе: ${product.stock} шт.`}
          </span>
          {product.rating != null && <StarRating rating={product.rating} />}
        </div>
      </div>
      <div className="productCard__actions">
        <button className="btn" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  )
}
