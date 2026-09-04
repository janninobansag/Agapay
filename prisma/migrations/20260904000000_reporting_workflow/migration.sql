-- Add resident cancellation as an explicit terminal state.
ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Audit records are append-only. PostgreSQL rejects updates and deletes even
-- if application-level authorization is bypassed.
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog rows are immutable';
END;
$$;

DROP TRIGGER IF EXISTS audit_log_immutable ON "AuditLog";
CREATE TRIGGER audit_log_immutable
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
