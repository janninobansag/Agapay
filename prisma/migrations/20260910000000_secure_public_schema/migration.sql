-- Agapay accesses PostgreSQL only from trusted server-side Prisma code. These
-- tables must not be reachable through Supabase's public Data API roles.
--
-- RLS deliberately has no browser-facing policies: Auth.js owns application
-- authentication and authorization, while the PostgreSQL table owner used by
-- Prisma retains its normal server-side access. Do not FORCE ROW LEVEL
-- SECURITY unless the application is first changed to use dedicated database
-- roles and tested policies.

DO $$
DECLARE
  table_name text;
  api_role text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    '_prisma_migrations',
    'User',
    'OAuthAccount',
    'IssueCategory',
    'ServiceArea',
    'ResponseTeam',
    'TeamMember',
    'Report',
    'ReportMedia',
    'ReportStatusEvent',
    'Notification',
    'AuditLog'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);

    -- GitHub CI uses plain PostgreSQL and does not create Supabase API roles.
    -- Check for each role so this migration remains portable and testable.
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated']
    LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I', table_name, api_role);
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
