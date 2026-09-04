import { randomBytes } from "node:crypto";

export function createReportPublicId(date = new Date()) {
  const year = date.getUTCFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `AGP-${year}-${suffix}`;
}
