const DEFAULT_LOCAL_UPLOAD_LIMIT = 20_000_000;
const DEFAULT_VERCEL_UPLOAD_LIMIT = 4_000_000;

export function isVercelEnvironment() {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
}

export function isBlobStorageEnabled() {
  return process.env.UPLOAD_STORAGE === "blob" || Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isPasswordResetDebugEnabled() {
  return process.env.PASSWORD_RESET_DEBUG === "true";
}

export function getAppBaseUrl(requestUrl?: string) {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (requestUrl) {
    return new URL(requestUrl).origin;
  }

  return "http://localhost:3000";
}

export function getUploadLimitBytes() {
  const fallback = isVercelEnvironment() ? DEFAULT_VERCEL_UPLOAD_LIMIT : DEFAULT_LOCAL_UPLOAD_LIMIT;
  const value = Number(process.env.UPLOAD_MAX_TOTAL_BYTES ?? `${fallback}`);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kib = bytes / 1024;
  if (kib < 1024) {
    return `${kib.toFixed(1)} KB`;
  }

  const mib = kib / 1024;
  return `${mib.toFixed(1)} MB`;
}
