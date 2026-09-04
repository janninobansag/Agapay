import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "report-evidence";

if (!url || !key) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: existing, error: readError } = await supabase.storage.getBucket(bucket);
if (readError && !readError.message.toLowerCase().includes("not found")) throw readError;

if (!existing) {
  const { error } = await supabase.storage.createBucket(bucket, {
    public: false,
    allowedMimeTypes: ["image/webp"],
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error) throw error;
  console.log(`Created private bucket: ${bucket}`);
} else {
  console.log(`Private bucket already exists: ${bucket}`);
}
