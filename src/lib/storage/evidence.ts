import "server-only";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "report-evidence";
  return url && key ? { url, key, bucket } : null;
}

function client() {
  const value = config();
  if (!value) return null;
  return { storage: createClient(value.url, value.key, { auth: { persistSession: false, autoRefreshToken: false } }).storage, bucket: value.bucket };
}

export function isEvidenceStorageConfigured() {
  return config() !== null;
}

export async function uploadEvidence(file: File, ownerId: string, publicId: string) {
  const service = client();
  if (!service) throw new Error("Evidence storage is not configured.");
  if (!allowedTypes.has(file.type)) throw new Error("Use a JPG, PNG, or WebP image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("The image must be 10 MB or smaller.");

  const output = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const objectKey = `${ownerId}/${publicId}/${crypto.randomUUID()}.webp`;
  const { error } = await service.storage.from(service.bucket).upload(objectKey, output, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Evidence upload failed: ${error.message}`);
  return { objectKey, url: `supabase://${service.bucket}/${objectKey}`, mimeType: "image/webp", sizeBytes: output.byteLength };
}

export async function removeEvidence(objectKey: string) {
  const service = client();
  if (service) await service.storage.from(service.bucket).remove([objectKey]);
}

export async function getEvidenceUrl(objectKey: string) {
  const service = client();
  if (!service) return null;
  const { data, error } = await service.storage.from(service.bucket).createSignedUrl(objectKey, 15 * 60);
  return error ? null : data.signedUrl;
}
