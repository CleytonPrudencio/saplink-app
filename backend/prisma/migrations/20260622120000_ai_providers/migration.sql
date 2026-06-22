-- IA BYO: provedor por consultoria + base de conhecimento aprendida
CREATE TABLE IF NOT EXISTS "AiProviderConfig" (
  "consultancyId" TEXT NOT NULL,
  "primary" TEXT NOT NULL DEFAULT 'ollama',
  "fallback" TEXT,
  "learnFromExternal" BOOLEAN NOT NULL DEFAULT false,
  "anthropicKey" TEXT,
  "anthropicModel" TEXT,
  "openaiKey" TEXT,
  "openaiModel" TEXT,
  "azureKey" TEXT,
  "azureEndpoint" TEXT,
  "azureDeployment" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiProviderConfig_pkey" PRIMARY KEY ("consultancyId")
);

CREATE TABLE IF NOT EXISTS "AiKnowledge" (
  "id" TEXT NOT NULL,
  "consultancyId" TEXT NOT NULL,
  "topicKey" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiKnowledge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiKnowledge_consultancyId_topicKey_idx" ON "AiKnowledge"("consultancyId","topicKey");
