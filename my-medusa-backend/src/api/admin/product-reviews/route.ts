import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { promises as fs } from "fs";
import path from "path";

// استفاده از همان فایل دیتابیس
const DB_PATH = path.resolve(process.cwd(), ".data", "product-reviews.json");

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch { return []; }
}

async function writeDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function setCorsHeaders(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
}

// GET: دریافت همه نظرات (برای ادمین)
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  const reviews = await readDb();
  res.json({ reviews: reviews.reverse() });
}

// PUT: تغییر وضعیت (تایید/رد)
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  const { id, status } = req.body as any;
  
  const reviews = await readDb();
  const index = reviews.findIndex((r: any) => r.id === id);
  
  if (index > -1) {
    reviews[index].status = status; // approved | rejected | pending
    await writeDb(reviews);
    res.json({ message: "Updated", review: reviews[index] });
  } else {
    res.status(404).json({ message: "Review not found" });
  }
}

// DELETE: حذف نظر
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  const { id } = req.body as any;
  
  let reviews = await readDb();
  reviews = reviews.filter((r: any) => r.id !== id);
  
  await writeDb(reviews);
  res.json({ message: "Deleted" });
}