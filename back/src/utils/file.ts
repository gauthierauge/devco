import fs from "node:fs/promises"
import path from "node:path"
import { logger } from "@/config/logger.js"

const uploadsDir = path.join(process.cwd(), "public", "uploads")

const toFilePath = (imagePath: string): string =>
    path.join(uploadsDir, path.basename(imagePath))

const safeUnlink = (filePath: string): Promise<void> =>
    fs.unlink(filePath).catch((err: unknown) => {
        logger.warn({ filePath, err }, "Impossible de supprimer le fichier image")
    })

const deleteUploadedFiles = (imagePaths: string[]): Promise<void> =>
    Promise.all(imagePaths.map((p) => safeUnlink(toFilePath(p)))).then(() => undefined)

export { deleteUploadedFiles, toFilePath }
