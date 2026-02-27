const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3200;

let products = [
  {
    id: nanoid(6),
    name: 'Ноутбук ASUS VivoBook 15',
    category: 'Ноутбуки',
    description: 'Тонкий и лёгкий ноутбук с экраном 15.6" Full HD, процессором Intel Core i5 и 16 ГБ оперативной памяти.',
    price: 64990,
    stock: 12,
    rating: 4.7,
  },
  {
    id: nanoid(6),
    name: 'Смартфон Samsung Galaxy S24',
    category: 'Смартфоны',
    description: 'Флагманский смартфон с камерой 200 МП, экраном Dynamic AMOLED 2X и аккумулятором 4000 мАч.',
    price: 89990,
    stock: 25,
    rating: 4.8,
  },
  {
    id: nanoid(6),
    name: 'Беспроводные наушники Sony WH-1000XM5',
    category: 'Аудио',
    description: 'Наушники с лучшим в классе шумоподавлением, временем работы до 30 часов и поддержкой Hi-Res Audio.',
    price: 29990,
    stock: 30,
    rating: 4.9,
  },
  {
    id: nanoid(6),
    name: 'Монитор LG 27" 4K IPS',
    category: 'Мониторы',
    description: 'Профессиональный монитор с разрешением 3840×2160, охватом цветового пространства DCI-P3 95% и USB-C.',
    price: 39990,
    stock: 8,
    rating: 4.6,
  },
  {
    id: nanoid(6),
    name: 'Механическая клавиатура Keychron K2',
    category: 'Периферия',
    description: 'Компактная механическая клавиатура с подсветкой RGB, переключателями Gateron Red и Bluetooth 5.1.',
    price: 8990,
    stock: 50,
    rating: 4.5,
  },
  {
    id: nanoid(6),
    name: 'Мышь Logitech MX Master 3S',
    category: 'Периферия',
    description: 'Эргономичная беспроводная мышь с колёсиком MagSpeed, сенсором 8000 DPI и поддержкой до 3 устройств.',
    price: 7490,
    stock: 40,
    rating: 4.8,
  },
  {
    id: nanoid(6),
    name: 'Планшет iPad Air 5',
    category: 'Планшеты',
    description: 'Планшет с чипом M1, экраном Liquid Retina 10.9", поддержкой Apple Pencil 2 и 5G.',
    price: 74990,
    stock: 15,
    rating: 4.7,
  },
  {
    id: nanoid(6),
    name: 'SSD Samsung 970 EVO Plus 1TB',
    category: 'Накопители',
    description: 'Высокоскоростной NVMe SSD с последовательным чтением до 3500 МБ/с и записью до 3300 МБ/с.',
    price: 8490,
    stock: 60,
    rating: 4.9,
  },
  {
    id: nanoid(6),
    name: 'Видеокарта NVIDIA RTX 4070',
    category: 'Комплектующие',
    description: 'Производительная видеокарта для игр в 1440p и 4K с поддержкой трассировки лучей и DLSS 3.',
    price: 59990,
    stock: 6,
    rating: 4.8,
  },
  {
    id: nanoid(6),
    name: 'Умная колонка Яндекс Станция 2',
    category: 'Умный дом',
    description: 'Голосовой помощник Алиса в компактном корпусе, стерео-звук 24 Вт, Zigbee-хаб для умного дома.',
    price: 14990,
    stock: 35,
    rating: 4.4,
  },
  {
    id: nanoid(6),
    name: 'Фитнес-браслет Xiaomi Smart Band 8',
    category: 'Носимые устройства',
    description: 'Лёгкий фитнес-трекер с AMOLED-экраном, мониторингом ЧСС, SpO2 и временем работы до 16 дней.',
    price: 3490,
    stock: 80,
    rating: 4.3,
  },
  {
    id: nanoid(6),
    name: 'Роутер TP-Link Archer AXE75',
    category: 'Сети',
    description: 'Трёхдиапазонный Wi-Fi 6E роутер со скоростью до 5400 Мбит/с, диапазоном 6 ГГц и 4 портами LAN.',
    price: 12990,
    stock: 20,
    rating: 4.6,
  },
];

// Middleware для парсинга JSON
app.use(express.json());

// CORS
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware для логирования запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Функция-помощник для получения товара из списка
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Товар не найден' });
    return null;
  }
  return product;
}

// POST /api/products — создание нового товара
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, rating } = req.body;

  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({
      error: 'Поля name, category, description, price и stock обязательны',
    });
  }
  if (Number(price) < 0) {
    return res.status(400).json({ error: 'Цена не может быть отрицательной' });
  }
  if (Number(stock) < 0) {
    return res.status(400).json({ error: 'Количество на складе не может быть отрицательным' });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating !== undefined ? Number(rating) : null,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// GET /api/products — получение списка товаров
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id — получение товара по ID
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

// PATCH /api/products/:id — частичное обновление товара
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { name, category, description, price, stock, rating } = req.body;

  const hasUpdate = [name, category, description, price, stock, rating].some(v => v !== undefined);
  if (!hasUpdate) {
    return res.status(400).json({ error: 'Нет полей для обновления' });
  }

  if (price !== undefined && Number(price) < 0) {
    return res.status(400).json({ error: 'Цена не может быть отрицательной' });
  }
  if (stock !== undefined && Number(stock) < 0) {
    return res.status(400).json({ error: 'Количество на складе не может быть отрицательным' });
  }

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);

  res.json(product);
});

// DELETE /api/products/:id — удаление товара
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: 'Товар не найден' });

  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
