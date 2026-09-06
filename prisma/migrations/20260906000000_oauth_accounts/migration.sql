-- Links a local Agapay user to a stable identity supplied by Google or Facebook.
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(40) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key"
ON "OAuthAccount"("provider", "providerAccountId");

CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

ALTER TABLE "OAuthAccount"
ADD CONSTRAINT "OAuthAccount_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
