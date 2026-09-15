-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "levelLabel" TEXT NOT NULL,
    "contentJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
