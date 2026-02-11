import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), ".data", "product-reviews.json");

async function ensureDataDir() {
    const dir = path.dirname(DB_PATH);
    try { await fs.access(dir); } 
    catch { await fs.mkdir(dir, { recursive: true }); }
}

async function readDb() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) { return []; }
}

async function writeDb(data: any) {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function setCorsHeaders(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
}

// GET: فقط نظرات تایید شده
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  try {
      const productId = req.query.product_id as string;
      const allReviews = await readDb();
      
      // 👇 تغییر مهم: فقط نظراتی که status === 'approved' هستند
      const productReviews = allReviews.filter((r: any) => 
        r.product_id === productId && r.status === "approved"
      );

      const avg = productReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / (productReviews.length || 1);

      res.json({ 
          reviews: productReviews.reverse(),
          count: productReviews.length,
          average_rating: parseFloat(avg.toFixed(1))
      });
  } catch (e: any) {
      res.status(500).json({ message: "Server Error" });
  }
}

// POST: ثبت با وضعیت 'pending'
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  try {
      const { product_id, user_name, rating, comment } = req.body as any;

      if (!product_id || !rating || !user_name) {
        return res.status(400).json({ message: "Data missing" });
      }

      const newReview = {
        id: Date.now().toString(),
        product_id,
        user_name,
        rating: Number(rating),
        comment: comment || "",
        created_at: new Date().toISOString(),
        status: "pending" // 👇 وضعیت پیش‌فرض: در انتظار تایید
      };

      const allReviews = await readDb();
      allReviews.push(newReview);
      await writeDb(allReviews);

      res.json({ message: "Review added", review: newReview });
  } catch (error: any) {
      res.status(500).json({ message: error.message });
  }
}