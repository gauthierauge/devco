import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_BODY_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

type UploadedFile = {
  filename: string;
  mimetype: string;
  size: number;
};

const detectMime = (buffer: Buffer): string | null => {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSig.every((byte, idx) => buffer[idx] === byte)) {
    return "image/png";
  }

  const gifSig = buffer.subarray(0, 6).toString("ascii");
  if (gifSig === "GIF87a" || gifSig === "GIF89a") {
    return "image/gif";
  }

  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return "image/webp";
  }

  return null;
};

const extensionFromMime = (mimetype: string) => {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
};

const parseMultipart = (req: Request) => {
  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw new Error("Invalid content type");
  }

  const boundaryMatch = contentType.match(/boundary=(.+)$/i);
  if (!boundaryMatch) {
    throw new Error("Missing boundary");
  }

  const boundary = `--${boundaryMatch[1]}`;
  const chunks: Buffer[] = [];

  return new Promise<{ fields: Record<string, string>; files: UploadedFile[] }>((resolve, reject) => {
    let totalSize = 0;
    req.on("data", (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", reject);
    req.on("end", () => {
      try {
        const buffer = Buffer.concat(chunks);
        const parts = buffer
          .toString("latin1")
          .split(boundary)
          .slice(1, -1);

        const fields: Record<string, string> = {};
        const files: UploadedFile[] = [];

        for (const part of parts) {
          const [rawHeaders, rawBody] = part.split("\r\n\r\n");
          if (!rawHeaders || !rawBody) continue;

          const headers = rawHeaders.split("\r\n").filter(Boolean);
          const disposition = headers.find((h) => h.toLowerCase().startsWith("content-disposition"));
          if (!disposition) continue;

          const nameMatch = disposition.match(/name="([^"]+)"/i);
          if (!nameMatch) continue;
          const fieldName = nameMatch[1];

          const filenameMatch = disposition.match(/filename="([^"]*)"/i);
          const contentTypeHeader = headers.find((h) => h.toLowerCase().startsWith("content-type"));
          const mimetype = contentTypeHeader?.split(":")[1]?.trim() || "";

          const body = rawBody.slice(0, -2);

          if (filenameMatch && filenameMatch[1]) {
            if (!ALLOWED_MIME.includes(mimetype)) {
              throw new Error("Invalid image type");
            }

            const fileBuffer = Buffer.from(body, "latin1");
            if (fileBuffer.length > MAX_FILE_SIZE) {
              throw new Error("File too large");
            }

            const detectedMime = detectMime(fileBuffer);
            if (!detectedMime || !ALLOWED_MIME.includes(detectedMime)) {
              throw new Error("Invalid image content");
            }

            if (detectedMime !== mimetype) {
              throw new Error("Mimetype mismatch");
            }

            if (files.length >= MAX_FILES) {
              throw new Error("Too many files");
            }

            ensureUploadsDir();
            const ext = extensionFromMime(detectedMime);
            const filename = `${randomUUID()}${ext}`;
            fs.writeFileSync(path.join(uploadsDir, filename), fileBuffer);
            files.push({ filename, mimetype: detectedMime, size: fileBuffer.length });
          } else {
            fields[fieldName] = Buffer.from(body, "latin1").toString("utf8");
          }
        }

        resolve({ fields, files });
      } catch (err) {
        reject(err);
      }
    });
  });
};

const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fields, files } = await parseMultipart(req);
    req.body = fields;
    (req as Request & { files?: UploadedFile[] }).files = files;
    next();
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export { uploadImages };
export type { UploadedFile };
