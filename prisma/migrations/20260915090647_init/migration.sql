-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'FR',
    "schoolLevel" TEXT NOT NULL,
    "track" TEXT,
    "specialities" TEXT,
    "ageRangeMin" INTEGER,
    "ageRangeMax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMastery" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "masteryPct" INTEGER NOT NULL DEFAULT 50,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageDataUrl" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'correction',
    "subject" TEXT,
    "chapter" TEXT,
    "detectedLevel" TEXT,
    "difficulty" TEXT,
    "exerciseType" TEXT,
    "analysisJson" TEXT,
    "solutionJson" TEXT,
    "qualityScore" INTEGER,
    "qualityJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionSheet" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imagesJson" TEXT NOT NULL,
    "sheetType" TEXT NOT NULL DEFAULT 'standard',
    "subject" TEXT,
    "chapter" TEXT,
    "detectedLevel" TEXT,
    "analysisJson" TEXT,
    "contentJson" TEXT,
    "qualityScore" INTEGER,
    "qualityJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Explanation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageDataUrl" TEXT NOT NULL,
    "depth" TEXT NOT NULL DEFAULT 'normal',
    "subject" TEXT,
    "chapter" TEXT,
    "detectedLevel" TEXT,
    "analysisJson" TEXT,
    "roundsJson" TEXT,
    "qualityScore" INTEGER,
    "qualityJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillMastery_profileId_subject_skill_key" ON "SkillMastery"("profileId", "subject", "skill");

-- AddForeignKey
ALTER TABLE "SkillMastery" ADD CONSTRAINT "SkillMastery_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionSheet" ADD CONSTRAINT "RevisionSheet_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
