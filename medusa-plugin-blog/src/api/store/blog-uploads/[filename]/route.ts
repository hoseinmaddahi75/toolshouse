import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = path.resolve(process.cwd(), ".uploads", "blog")

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { filename } = req.params
  const filePath = path.resolve(UPLOAD_DIR, filename)

  if (!filePath.startsWith(UPLOAD_DIR) || !fs.existsSync(filePath)) {
    res.status(404).json({ message: "File not found" })
    return
  }

  const ext = path.extname(filename).toLowerCase()
  res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream")
  res.setHeader("Access-Control-Allow-Origin", "*")
  fs.createReadStream(filePath).pipe(res as any)
}
