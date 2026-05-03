FROM node:18-alpine

WORKDIR /app

# Сначала копируем манифесты — это позволяет Docker
# кэшировать слой с npm install, пока зависимости не меняются.
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
