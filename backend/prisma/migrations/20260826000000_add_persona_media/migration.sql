-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "PersonaMedia" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonaMedia_personaId_idx" ON "PersonaMedia"("personaId");

-- AddForeignKey
ALTER TABLE "PersonaMedia" ADD CONSTRAINT "PersonaMedia_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;