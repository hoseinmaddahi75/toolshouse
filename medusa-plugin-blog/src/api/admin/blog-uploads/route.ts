import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import multer from "multer"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = path.resolve(process.cwd(), ".uploads", "blog")

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  },
})

const upload = multer({ storage })

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  upload.array("files")(req as any, res as any, (err: any) => {
    if (err) {
      res.status(500).json({ message: "Upload failed", error: err.message })
      return
    }

    const files = (req as any).files as Express.Multer.File[] | undefined

    if (!files?.length) {
      res.status(400).json({ message: "No files uploaded" })
      return
    }

    const uploads = files.map((file) => ({
      url: `/store/blog-uploads/${file.filename}`,
      filename: file.filename,
    }))

    res.json({ uploads })
  })
}
