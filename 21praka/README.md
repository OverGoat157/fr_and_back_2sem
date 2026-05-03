# Практическое занятие №21 — Кэширование с Redis

Доработка приложения из практики №11: добавлено кэширование GET-запросов через Redis.

## Кэшируемые маршруты

| Маршрут             | Метод | Время кэша | Описание                         |
| ------------------- | ----- | ---------- | -------------------------------- |
| /api/users          | GET   | 1 минута   | Получить список пользователей    |
| /api/users/:id      | GET   | 1 минута   | Получить пользователя по id      |
| /api/products       | GET   | 10 минут   | Получить список товаров          |
| /api/products/:id   | GET   | 10 минут   | Получить товар по id             |

При обновлении/удалении пользователя или товара соответствующий ключ кэша удаляется через `invalidateUsersCache` / `invalidateProductsCache`.

В ответе указано поле `source`:
- `"server"` — данные получены из источника и сохранены в Redis;
- `"cache"` — данные получены из Redis.

## Запуск

1. Запустить Redis (например, в Docker):
   ```bash
   docker run -d --name redis-cache -p 6379:6379 redis
   ```
2. Установить зависимости и запустить:
   ```bash
   npm install
   npm start
   ```
3. Опциональные переменные окружения:
   - `REDIS_URL` (по умолчанию `redis://127.0.0.1:6379`)

## Учётка администратора

При старте создаётся пользователь:
- email: `admin@test.com`
- password: `admin123`
- role: `admin`

## Проверка работы кэша

```bash
# Логин администратора
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq -r .accessToken)

# Первый запрос — source: "server"
curl http://localhost:3000/api/products -H "Authorization: Bearer $TOKEN"

# Повторный запрос — source: "cache"
curl http://localhost:3000/api/products -H "Authorization: Bearer $TOKEN"
```
