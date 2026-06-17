FROM node:20-alpine
WORKDIR /app
COPY package.json ./
# Sem dependências obrigatórias (usa fetch nativo). node-rfc é opcional e só no modo rfc.
RUN npm install --omit=dev || true
COPY src ./src
USER node
CMD ["node", "src/index.js"]
