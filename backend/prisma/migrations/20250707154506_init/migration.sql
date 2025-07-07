-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "age" INTEGER,
    "weight" DOUBLE PRECISION,
    "gender" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptom_reports" (
    "id" TEXT NOT NULL,
    "symptoms" TEXT[],
    "severity" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "petId" TEXT NOT NULL,

    CONSTRAINT "symptom_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptom_analyses" (
    "id" TEXT NOT NULL,
    "aiAnalysis" TEXT NOT NULL,
    "recommendations" TEXT[],
    "urgencyLevel" TEXT NOT NULL,
    "suggestedActions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "symptomReportId" TEXT NOT NULL,

    CONSTRAINT "symptom_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "symptom_analyses_symptomReportId_key" ON "symptom_analyses"("symptomReportId");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom_reports" ADD CONSTRAINT "symptom_reports_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom_analyses" ADD CONSTRAINT "symptom_analyses_symptomReportId_fkey" FOREIGN KEY ("symptomReportId") REFERENCES "symptom_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
