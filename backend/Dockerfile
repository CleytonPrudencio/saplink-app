FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 8080

# Seed NÃO roda no boot (evita risco de dados). Rode manualmente uma vez em banco novo:
#   docker compose exec backend npm run seed
CMD ["sh", "-c", "npx prisma migrate deploy && node --import tsx src/server.ts"]
