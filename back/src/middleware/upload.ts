import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 2 * 1024 * 1024;
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
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
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

          if (files.length >= MAX_FILES) {
            throw new Error("Too many files");
          }

          ensureUploadsDir();
          const ext = path.extname(filenameMatch[1]).toLowerCase() || ".bin";
          const filename = `${randomUUID()}${ext}`;
          fs.writeFileSync(path.join(uploadsDir, filename), fileBuffer);
          files.push({ filename, mimetype, size: fileBuffer.length });
        } else {
          fields[fieldName] = Buffer.from(body, "latin1").toString("utf8");
        }
      }

      resolve({ fields, files });
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
