-- Plano: descrição, destaque, ordenação e preços de add-on
ALTER TABLE "Plan" ADD COLUMN "description" TEXT;
ALTER TABLE "Plan" ADD COLUMN "highlight" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plan" ADD COLUMN "addonIntegrationCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plan" ADD COLUMN "addonUserCents" INTEGER NOT NULL DEFAULT 0;
-- Assinatura: add-ons contratados
ALTER TABLE "Subscription" ADD COLUMN "extraIntegrations" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "extraUsers" INTEGER NOT NULL DEFAULT 0;
