-- Audit records remain append-only. The sole allowed update is PostgreSQL's
-- foreign-key cleanup of actorId when that user is permanently deleted.
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND OLD."actorId" IS NOT NULL
    AND NEW."actorId" IS NULL
    AND OLD."id" = NEW."id"
    AND OLD."action" = NEW."action"
    AND OLD."entityType" = NEW."entityType"
    AND OLD."entityId" = NEW."entityId"
    AND OLD."metadata" IS NOT DISTINCT FROM NEW."metadata"
    AND OLD."createdAt" = NEW."createdAt"
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'AuditLog rows are immutable';
END;
$$;
