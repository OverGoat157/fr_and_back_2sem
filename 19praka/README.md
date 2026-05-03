# Практическое занятие №19 — Работа с PostgreSQL

REST API для управления пользователями с хранением данных в PostgreSQL через ORM Sequelize.

## Сущность User

| Поле        | Тип данных | Описание                        |
| ----------- | ---------- | ------------------------------- |
| id          | INTEGER    | Уникальный идентификатор (PK)   |
| first_name  | VARCHAR    | Имя пользователя                |
| last_name   | VARCHAR    | Фамилия пользователя            |
| age         | INTEGER    | Возраст пользователя            |
| created_at  | TIMESTAMP  | Время создания записи           |
| updated_at  | TIMESTAMP  | Время последнего обновления     |

## Маршруты

| Адрес            | Метод  | Описание                          |
| ---------------- | ------ | --------------------------------- |
| /api/users       | POST   | Создание нового пользователя      |
| /api/users       | GET    | Получение списка пользователей    |
| /api/users/:id   | GET    | Получение пользователя по id      |
| /api/users/:id   | PATCH  | Обновление пользователя           |
| /api/users/:id   | DELETE | Удаление пользователя             |

## Запуск

1. Запустить PostgreSQL и создать БД `usersdb`:
   ```sql
   CREATE DATABASE usersdb;
   ```
2. Установить зависимости и запустить сервер:
   ```bash
   npm install
   npm start
   ```
3. Переменные окружения (опционально):
   - `DB_HOST` (по умолчанию `localhost`)
   - `DB_PORT` (по умолчанию `5432`)
   - `DB_NAME` (по умолчанию `usersdb`)
   - `DB_USER` (по умолчанию `postgres`)
   - `DB_PASSWORD` (по умолчанию `postgres`)
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
curl http://localhost:3000/api/users/1

# Обновить
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":26}'

# Удалить
curl -X DELETE http://localhost:3000/api/users/1
```
