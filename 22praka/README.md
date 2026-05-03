# Практическое занятие №22 — Балансировка нагрузки (Nginx, HAProxy)

Тестовая система балансировки нагрузки: 3 backend-сервера на Node.js + балансировщик (Nginx или HAProxy).

## Состав

- `backend/server.js` — простой Express-сервер, отвечает на `GET /` JSON-ом с идентификатором экземпляра.
- `start-backends.sh` — скрипт запуска трёх экземпляров на портах 3000, 3001, 3002 (третий — backup).
- `nginx.conf` — конфигурация Nginx (round-robin, `max_fails=2`, `fail_timeout=30s`, backup-сервер).
- `haproxy.cfg` — альтернативная конфигурация HAProxy с health-checks.

## Запуск backend-серверов

```bash
cd 22praka
./start-backends.sh
# Серверы поднимутся на :3000, :3001, :3002
```

Остановить:
```bash
pkill -f "node server.js"
```

## Вариант 1: Nginx как балансировщик

```bash
# Запустить Nginx с конфигом из этого каталога (порт 8080)
sudo nginx -c "$(pwd)/nginx.conf" -p "$(pwd)"
```

или через Docker:
```bash
docker run --rm --name nginx-lb --network host \
  -v "$(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro" \
  nginx:alpine
```

Тестирование:
```bash
for i in 1 2 3 4; do curl -s http://localhost:8080/; echo; done
```
Должно последовательно приходить от backend-1 и backend-2 (round-robin), backend-3 — резервный.

## Вариант 2: HAProxy как балансировщик

```bash
docker run --rm --name haproxy-lb --network host \
  -v "$(pwd)/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro" \
  haproxy:2.9-alpine
```

Тестирование на порту 8081:
```bash
for i in 1 2 3 4; do curl -s http://localhost:8081/; echo; done
```

## Проверка отказоустойчивости

1. Остановить один из основных backend (например, на 3001):
   ```bash
   lsof -ti:3001 | xargs kill
   ```
2. Запросить балансировщик: запросы продолжат приходить от выжившего основного сервера.
3. Если оба основных недоступны — Nginx/HAProxy переключаются на backup (порт 3002).
