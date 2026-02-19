-- CreateTable
CREATE TABLE "CspReport" (
    "id" SERIAL NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CspReport_pkey" PRIMARY KEY ("id")
);
