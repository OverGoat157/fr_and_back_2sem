const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SERVER_ID = process.env.SERVER_ID || 'backend-?';

app.get('/', (req, res) => {
  res.json({
    server: SERVER_ID,
    port: PORT,
    pid: process.pid,
    time: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: SERVER_ID });
});

// Слушаем на 0.0.0.0 — обязательно для контейнеров,
// чтобы трафик из Docker-сети попадал в процесс.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend ${SERVER_ID} running on port ${PORT}`);
});
