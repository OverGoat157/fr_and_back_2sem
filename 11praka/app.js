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

// Создаём админа при старте
(async () => {
  users.push({
    id: '1', email: 'admin@test.com', first_name: 'Admin', last_name: 'User',
    passwordHash: await bcrypt.hash('admin123', 10), role: 'admin', blocked: false,
  });
})();

function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}
function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    const user = users.find(u => u.id === req.user.sub);
    if (user?.blocked) return res.status(403).json({ error: 'User is blocked' });
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;
  if (!email || !password || !first_name || !last_name) return res.status(400).json({ error: 'All fields required' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'Email exists' });
  const validRole = ['user', 'seller'].includes(role) ? role : 'user';
  const user = { id: String(users.length + 1), email, first_name, last_name, passwordHash: await bcrypt.hash(password, 10), role: validRole, blocked: false };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.blocked) return res.status(403).json({ error: 'User is blocked' });
  if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  res.json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  if (!refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    refreshTokens.delete(refreshToken);
    const newAT = generateAccessToken(user);
    const newRT = generateRefreshToken(user);
    refreshTokens.add(newRT);
    res.json({ accessToken: newAT, refreshToken: newRT });
  } catch { return res.status(401).json({ error: 'Invalid or expired refresh token' }); }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

// Users routes (admin only)
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked })));
});
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const u = users.find(u => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked });
});
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const u = users.find(u => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  const { first_name, last_name, role } = req.body;
  if (first_name) u.first_name = first_name;
  if (last_name) u.last_name = last_name;
  if (role && ['user', 'seller', 'admin'].includes(role)) u.role = role;
  res.json({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked });
});
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const u = users.find(u => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  u.blocked = !u.blocked;
  res.json({ message: u.blocked ? 'User blocked' : 'User unblocked' });
});

// Products routes
app.get('/api/products', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => res.json(products));
app.get('/api/products/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const p = products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !category || price === undefined) return res.status(400).json({ error: 'title, category, price required' });
  const product = { id: nanoid(), title, category, description: description || '', price: Number(price) };
  products.push(product);
  res.status(201).json(product);
});
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const p = products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { title, category, description, price } = req.body;
  if (title !== undefined) p.title = title;
  if (category !== undefined) p.category = category;
  if (description !== undefined) p.description = description;
  if (price !== undefined) p.price = Number(price);
  res.json(p);
});
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
