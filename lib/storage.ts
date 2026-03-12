import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { slugify } from "@/lib/utils";
import type { AssetLink } from "@/lib/domain";
import {
  formatBytes,
  getUploadLimitBytes,
  isBlobStorageEnabled,
  isVercelEnvironment,
} from "@/lib/runtime";

function buildSafeName(file: File) {
  const ext = path.extname(file.name || "") || "";
  const baseName = path.basename(file.name || "upload", ext);
  return `${Date.now()}-${slugify(baseName || "upload")}${ext}`;
}

export function assertUploadConstraints(files: File[]) {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const limit = getUploadLimitBytes();

  if (totalBytes > limit) {
    throw new Error(`添付ファイル合計は ${formatBytes(limit)} 以内にしてください。`);
  }
}

async function persistFileLocally(file: File, folder: string): Promise<AssetLink> {
  const safeName = buildSafeName(file);
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  const target = path.join(dir, safeName);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target, buffer);
  return {
    name: file.name,
    url: `/uploads/${folder}/${safeName}`,
  };
}

async function persistFileToBlob(file: File, folder: string): Promise<AssetLink> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Blob ストレージを使うには BLOB_READ_WRITE_TOKEN を設定してください。");
  }

  const safeName = buildSafeName(file);
  const blob = await put(`${folder}/${safeName}`, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || undefined,
  });

  return {
    name: file.name,
    url: blob.url,
  };
}

async function persistFile(file: File, folder: string): Promise<AssetLink | null> {
  if (!file || file.size === 0) return null;

  if (isBlobStorageEnabled()) {
    return persistFileToBlob(file, folder);
  }

  if (isVercelEnvironment()) {
    throw new Error("Vercel 本番では UPLOAD_STORAGE=blob と BLOB_READ_WRITE_TOKEN が必要です。");
  }

  return persistFileLocally(file, folder);
}

export async function saveFiles(files: File[], folder: string) {
  const saved = await Promise.all(files.map((file) => persistFile(file, folder)));
  return saved.filter(Boolean) as AssetLink[];
}
