import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export type ImageLoadErrorCode = "invalid-image-input" | "sha-mismatch" | "malformed-image" | "image-swap-refused";

export interface ImageLoadError {
  code: ImageLoadErrorCode;
  path: string;
  message: string;
}

export interface LoadedImage {
  format: "cael.os.md.v1";
  os_sha: string;
  cachedPrefix: string;
  prefixHash: string;
  tenantFingerprint?: string | undefined;
  updateHeartbeat?: ImageUpdateHeartbeat | undefined;
}

export interface ImageUpdateHeartbeat {
  tenant_id: string;
  os_sha: string;
  heartbeat_ref: string;
}

export interface LoadImageOptions {
  expectedOsSha?: string | undefined;
  tenantFingerprint?: string | undefined;
}

export type ImageLoadResult = { ok: true; image: LoadedImage } | { ok: false; error: ImageLoadError };

export interface ImageBootSession {
  readonly image: LoadedImage | null;
  boot(bytesOrPath: string | Uint8Array, options?: LoadImageOptions): ImageLoadResult;
}

const beginMarker = "<!-- CAEL_OS_IMAGE_V1_BEGIN -->";
const endMarker = "<!-- CAEL_OS_IMAGE_V1_END -->";

export function loadImage(bytesOrPath: string | Uint8Array, options: LoadImageOptions = {}): ImageLoadResult {
  const bytesResult = readBytes(bytesOrPath);
  if (!bytesResult.ok) return bytesResult;
  const bytes = bytesResult.bytes;
  const osSha = sha256(bytes);
  if (options.expectedOsSha !== undefined && options.expectedOsSha !== osSha) {
    return failure("sha-mismatch", "$.os_sha", `expected ${options.expectedOsSha}, got ${osSha}`);
  }

  const text = Buffer.from(bytes).toString("utf8");
  if (!isWellFormedImage(text)) {
    return failure("malformed-image", "$", "image missing cael.os.md v1 begin/end markers");
  }

  const image: LoadedImage = {
    format: "cael.os.md.v1",
    os_sha: osSha,
    cachedPrefix: text,
    prefixHash: sha256(Buffer.from(text, "utf8"))
  };
  if (options.tenantFingerprint !== undefined) image.tenantFingerprint = options.tenantFingerprint;
  return { ok: true, image };
}

export function createImageBootSession(): ImageBootSession {
  let booted: LoadedImage | null = null;
  return {
    get image() {
      return booted;
    },
    boot(bytesOrPath: string | Uint8Array, options: LoadImageOptions = {}) {
      const loaded = loadImage(bytesOrPath, options);
      if (!loaded.ok) return loaded;
      if (booted && booted.os_sha !== loaded.image.os_sha) {
        return failure("image-swap-refused", "$.os_sha", "session image is immutable after boot");
      }
      booted = loaded.image;
      return loaded;
    }
  };
}

export function hashImageBytes(bytes: string | Uint8Array): string {
  return sha256(typeof bytes === "string" ? Buffer.from(bytes, "utf8") : bytes);
}

function readBytes(bytesOrPath: string | Uint8Array): { ok: true; bytes: Uint8Array } | { ok: false; error: ImageLoadError } {
  if (bytesOrPath instanceof Uint8Array) return { ok: true, bytes: bytesOrPath };
  if (typeof bytesOrPath !== "string") return failure("invalid-image-input", "$", "expected path or bytes");
  try {
    return { ok: true, bytes: readFileSync(bytesOrPath) };
  } catch {
    return { ok: true, bytes: Buffer.from(bytesOrPath, "utf8") };
  }
}

function isWellFormedImage(text: string): boolean {
  const begin = text.indexOf(beginMarker);
  const end = text.indexOf(endMarker);
  return begin >= 0 && end > begin && text.slice(begin + beginMarker.length, end).trim().length > 0;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function failure(code: ImageLoadErrorCode, path: string, message: string): { ok: false; error: ImageLoadError } {
  return { ok: false, error: { code, path, message } };
}
