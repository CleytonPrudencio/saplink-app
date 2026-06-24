-- User: escopo de clientes
ALTER TABLE "User" ADD COLUMN "allClients" BOOLEAN NOT NULL DEFAULT true;

-- UserClient: atribuição usuário ↔ cliente
CREATE TABLE "UserClient" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserClient_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserClient_userId_clientId_key" ON "UserClient"("userId", "clientId");
CREATE INDEX "UserClient_clientId_idx" ON "UserClient"("clientId");
ALTER TABLE "UserClient" ADD CONSTRAINT "UserClient_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserClient" ADD CONSTRAINT "UserClient_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
