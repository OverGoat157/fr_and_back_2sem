const express = require('express');
const app = express();
const port = 3200;

// Middleware для парсинга JSON
app.use(express.json());

// В памяти хранилище товаров (замените на БД в продакшене)
let products = [
  { id: 1, name: 'Ноутбук', price: 99990 },
  { id: 2, name: 'Смартфон', price: 49990 }
];
let nextId = 3;

// GET /products - Получить все товары
app.get('/products', (req, res) => {
  res.json(products);
});

// GET /products/:id - Получить товар по ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  res.json(product);
});

// POST /products - Создать новый товар
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  
  // Валидация
  if (!name || !price || price < 0) {
    return res.status(400).json({ 
      error: 'Название и цена обязательны, цена должна быть положительной' 
    });
  }
  
  const newProduct = {
    id: nextId++,
    name: name.trim(),
    price: parseFloat(price)
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /products/:id - Обновить товар полностью
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  if (!name || !price || price < 0) {
    return res.status(400).json({ 
      error: 'Название и цена обязательны, цена должна быть положительной' 
    });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    name: name.trim(),
    price: parseFloat(price)
  };
  
  res.json(products[productIndex]);
});

// PATCH /products/:id - Частичное обновление товара
app.patch('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  const updates = req.body;
  if (updates.price !== undefined && (updates.price < 0 || isNaN(updates.price))) {
    return res.status(400).json({ error: 'Цена должна быть положительным числом' });
  }
  
  products[productIndex] = { ...products[productIndex], ...updates };
  res.json(products[productIndex]);
});

// DELETE /products/:id - Удалить товар
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  
  products.splice(productIndex, 1);
  res.status(204).send();
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Документация API: http://localhost:${port}/docs`);
});

// Дополнительный эндпоинт с документацией
app.get('/docs', (req, res) => {
  res.json({
    documentation: {
      "GET /products": "Получить все товары",
      "GET /products/:id": "Получить товар по ID",
      "POST /products": "Создать товар {name: string, price: number}",
      "PUT /products/:id": "Полностью обновить товар",
      "PATCH /products/:id": "Частично обновить товар",
      "DELETE /products/:id": "Удалить товар"
    }
  });
});
