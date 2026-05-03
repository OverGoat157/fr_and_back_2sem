# Практическое занятие №20 — Работа с MongoDB

REST API для управления пользователями с хранением данных в MongoDB через Mongoose.

## Сущность User

| Поле        | Тип       | Описание                              |
| ----------- | --------- | ------------------------------------- |
| _id         | ObjectId  | Уникальный идентификатор (генерируется MongoDB) |
| first_name  | String    | Имя пользователя                      |
| last_name   | String    | Фамилия пользователя                  |
| age         | Number    | Возраст пользователя (0–150)          |
| created_at  | Date      | Время создания                        |
| updated_at  | Date      | Время последнего обновления           |

## Маршруты

| Адрес            | Метод  | Описание                          |
| ---------------- | ------ | --------------------------------- |
| /api/users       | POST   | Создание нового пользователя      |
| /api/users       | GET    | Получение списка пользователей    |
| /api/users/:id   | GET    | Получение пользователя по id      |
| /api/users/:id   | PATCH  | Обновление пользователя           |
| /api/users/:id   | DELETE | Удаление пользователя             |

## Запуск

1. Установить и запустить MongoDB (локально или в Docker):
   ```bash
   docker run -d --name mongo -p 27017:27017 mongo:7
   ```
2. Установить зависимости и запустить:
   ```bash
   npm install
   npm start
   ```
3. Переменные окружения:
   - `MONGO_URL` (по умолчанию `mongodb://localhost:27017/usersdb`)
   - `PORT` (по умолчанию `3000`)

## Примеры запросов

```bash
# Создать пользователя
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Иван","last_name":"Иванов","age":25}'

# Получить всех
curl http://localhost:3000/api/users

# Получить по id
curl http://localhost:3000/api/users/<id>

# Обновить
curl -X PATCH http://localhost:3000/api/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"age":26}'

# Удалить
curl -X DELETE http://localhost:3000/api/users/<id>
```
