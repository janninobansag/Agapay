-- Optional usernames support the fixed administrator login while residents
-- continue to sign in with email addresses.
ALTER TABLE "User" ADD COLUMN "username" VARCHAR(30);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
