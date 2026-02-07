-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "editToken" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "patchVersion" TEXT NOT NULL DEFAULT '',
    "weaponStyle" TEXT NOT NULL DEFAULT '',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "statPriorities" TEXT NOT NULL DEFAULT '[]',
    "pros" TEXT NOT NULL DEFAULT '',
    "cons" TEXT NOT NULL DEFAULT '',
    "howToPlay" TEXT NOT NULL DEFAULT '',
    "variants" TEXT NOT NULL DEFAULT '',
    "rotation" TEXT NOT NULL DEFAULT '[]',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "cooldown" REAL NOT NULL DEFAULT 0,
    "castTime" REAL NOT NULL DEFAULT 0,
    "iconUrl" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "submittedBy" TEXT NOT NULL DEFAULT 'anonymous',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildId" TEXT NOT NULL,
    "voterIp" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildId" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Anonymous',
    "content" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildId" TEXT,
    "commentId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Build_slug_key" ON "Build"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Build_editToken_key" ON "Build"("editToken");

-- CreateIndex
CREATE INDEX "Build_published_upvotes_idx" ON "Build"("published", "upvotes");

-- CreateIndex
CREATE INDEX "Build_published_createdAt_idx" ON "Build"("published", "createdAt");

-- CreateIndex
CREATE INDEX "Build_tags_idx" ON "Build"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_approved_category_idx" ON "Skill"("approved", "category");

-- CreateIndex
CREATE INDEX "Skill_approved_name_idx" ON "Skill"("approved", "name");

-- CreateIndex
CREATE INDEX "Vote_buildId_idx" ON "Vote"("buildId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_buildId_voterIp_key" ON "Vote"("buildId", "voterIp");

-- CreateIndex
CREATE INDEX "Comment_buildId_createdAt_idx" ON "Comment"("buildId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");
