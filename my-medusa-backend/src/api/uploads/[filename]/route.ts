import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import fs from "fs";
import path from "path";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { filename } = req.params;
  // مسیر پوشه .uploads در ریشه پروژه
  const filePath = path.resolve(process.cwd(), ".uploads", filename);

  if (fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    // هدرهای مهم برای اینکه مرورگر بفهمد این یک عکس است
    res.setHeader("Content-Type", "image/jpeg"); // فرض می‌کنیم jpg است
    res.setHeader("Access-Control-Allow-Origin", "*"); // اجازه دسترسی به همه
    stream.pipe(res);
  } else {
    res.status(404).json({ message: "File not found", path: filePath });
  }
}