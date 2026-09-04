-- Resident-controlled delivery preference for future report updates.
ALTER TABLE "User"
ADD COLUMN "inAppNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
