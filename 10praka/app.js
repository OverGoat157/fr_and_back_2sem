const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

const PORT = 3000;
const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const users = [];
const refreshTokens = new Set();
let products = [
  { id: nanoid(), title: 'Ноутбук', category: 'Электроника', description: 'Мощный ноутбук', price: 75000 },
  { id: nanoid(), title: 'Смартфон', category: 'Электроника', description: 'Флагман', price: 45000 },
  { id: nanoid(), title: 'Наушники', category: 'Аксессуары', description: 'Беспроводные', price: 5000 },
];

function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password || !first_name || !last_name) return res.status(400).json({ error: 'All fields required' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'email already exists' });

  const user = { id: String(users.length + 1), email, first_name, last_name, passwordHash: await bcrypt.hash(password, 10) };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);

  res.json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });
  if (!refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });

    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

app.get('/api/products', (req, res) => res.json(products));
app.post('/api/products', authMiddleware, (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !category || price === undefined) return res.status(400).json({ error: 'title, category, price required' });
  const product = { id: nanoid(), title, category, description: description || '', price: Number(price) };
  products.push(product);
  res.status(201).json(product);
});
app.get('/api/products/:id', authMiddleware, (req, res) => {
  const p = products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});
app.put('/api/products/:id', authMiddleware, (req, res) => {
  const p = products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { title, category, description, price } = req.body;
  if (title !== undefined) p.title = title;
  if (category !== undefined) p.category = category;
  if (description !== undefined) p.description = description;
  if (price !== undefined) p.price = Number(price);
  res.json(p);
});
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
