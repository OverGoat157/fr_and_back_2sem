const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || `local-${PORT}`;

app.get('/', (req, res) => {
  res.json({
    message: 'Response from backend server',
    server: SERVER_ID,
    port: Number(PORT),
    pid: process.pid,
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: SERVER_ID });
});

app.listen(PORT, () => {
  console.log(`Backend ${SERVER_ID} started on port ${PORT}`);
});
