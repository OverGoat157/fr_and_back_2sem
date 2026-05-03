#!/bin/bash
# Запускает 3 backend-сервера (порты 3000, 3001, 3002) в фоне.
# Логи пишутся в backend-<port>.log.

cd "$(dirname "$0")/backend"

if [ ! -d node_modules ]; then
    npm install
fi

PORT=3000 SERVER_ID=backend-1 node server.js > ../backend-3000.log 2>&1 &
echo "Started backend-1 (PID $!)"

PORT=3001 SERVER_ID=backend-2 node server.js > ../backend-3001.log 2>&1 &
echo "Started backend-2 (PID $!)"

PORT=3002 SERVER_ID=backend-3-backup node server.js > ../backend-3002.log 2>&1 &
echo "Started backend-3 backup (PID $!)"

echo "All backends started. Use 'pkill -f \"node server.js\"' to stop."
