# Практическое занятие №23 — Контейнеризация с Docker

Веб-приложение из практики №22, развёрнутое через Docker Compose: три backend-контейнера на Node.js + Nginx как балансировщик нагрузки в общей Docker-сети.

## Структура

```
23praka/
├── docker-compose.yml      # Описание стека сервисов
├── nginx.conf              # Конфиг Nginx как балансировщика
└── backend/
    ├── Dockerfile          # Образ backend-сервиса
    ├── package.json
    ├── server.js           # Express, отвечает идентификатором экземпляра
    └── .dockerignore
```

## Сервисы

- `backend1`, `backend2` — основные backend на Node.js (Express).
- `backend3` — резервный backend (используется при недоступности основных).
- `nginx` — балансировщик, единственный сервис с проброшенным наружу портом `:80`.

В конфиге Nginx используются имена сервисов из `docker-compose.yml` (`backend1`, `backend2`, `backend3`) — Docker сам разрешит их в IP-адреса контейнеров.

## Запуск

```bash
cd 23praka
docker compose up --build
```

В фоне:
```bash
docker compose up -d --build
```

Логи:
```bash
docker compose logs -f
```

Остановка:
```bash
docker compose down
```

## Проверка балансировки

```bash
for i in 1 2 3 4 5 6; do curl -s http://localhost/; echo; done
```

Должно последовательно приходить от `backend-1` и `backend-2` (round-robin).

## Проверка отказоустойчивости

```bash
# Останавливаем один из основных backend
docker compose stop backend1

# Запросы продолжают идти через backend2 (а если упал и он — через backend3)
curl http://localhost/
curl http://localhost/

# Возвращаем backend1
docker compose start backend1
```

Поскольку в `nginx.conf` указан `max_fails=2 fail_timeout=30s`, после двух подряд неудачных попыток Nginx перестаёт отправлять запросы к упавшему серверу на 30 секунд.
