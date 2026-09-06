-- Permanent removal of a reporter also removes reports they own. The report
-- relations for evidence, status history, and report notifications already use
-- cascading deletion, so those records are removed by PostgreSQL as well.
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

ALTER TABLE "Report"
ADD CONSTRAINT "Report_reporterId_fkey"
FOREIGN KEY ("reporterId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
