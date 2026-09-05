const connectionString = process.env.TEST_DATABASE_URL;

if (!connectionString) {
  throw new Error("TEST_DATABASE_URL is required for integration tests. It must point to an isolated test database or schema.");
}

const url = new URL(connectionString);
const target = `${url.pathname} ${url.searchParams.get("schema") ?? ""}`.toLowerCase();

if (!target.includes("test")) {
  throw new Error("TEST_DATABASE_URL must use a database or schema name containing 'test' to protect development data.");
}
