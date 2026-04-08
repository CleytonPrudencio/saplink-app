# SAPLINK - Integration Health Monitor

Sistema de monitoramento de integrações SAP para consultorias. Dashboard multi-cliente, diagnóstico com IA em português, alertas em tempo real e relatórios white-label.

## Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Database:** PostgreSQL
- **AI:** Claude API (Anthropic)
- **Auth:** JWT

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Docker (para PostgreSQL)

### 1. Subir o banco de dados
```bash
docker-compose up -d
```

### 2. Rodar o backend
```bash
cd backend
npm install
cp .env.example .env  # ajuste se necessário
npx prisma migrate dev
npm run seed
npm run dev
```
Backend roda em http://localhost:8080

### 3. Rodar o frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend roda em http://localhost:3000

### 4. Acessar
- URL: http://localhost:3000
- Login: `admin@saplink.com` / `Saplink@2026`

## Estrutura

```
saplink-app/
├── frontend/          Next.js dashboard
├── backend/           Express API + Prisma
├── docker-compose.yml PostgreSQL
└── README.md
```

## Desenvolvido por
[CJL Consultoria](https://www.cjlconsultoria.com)
