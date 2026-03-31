# Контрольная работа №2

Результат выполнения практических заданий 7-11.

## Описание

Серверное приложение на Node.js с системой аутентификации (bcrypt + JWT) и авторизации (RBAC), CRUD для товаров и пользователей, фронтенд на React.

## Функциональность

- Регистрация и авторизация пользователей (bcrypt + JWT)
- Access и Refresh токены с автоматическим обновлением
- Ролевая модель: пользователь, продавец, администратор
- CRUD для товаров с разграничением прав
- Управление пользователями (администратор)
- React-фронтенд с axios interceptors

## Технологии

- **Backend**: Node.js, Express, bcrypt, jsonwebtoken, nanoid, cors
- **Frontend**: React 18, Vite, axios, react-router-dom, SCSS

## Запуск

### Backend
```bash
cd 11praka && npm install && node app.js
```

### Frontend
```bash
cd 11praka/client && npm install && npm run dev
```

## Тестовые данные

- Администратор: admin@test.com / admin123
