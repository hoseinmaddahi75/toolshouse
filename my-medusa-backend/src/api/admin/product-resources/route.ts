import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { promises as fs } from "fs";
import path from "path";

// مسیر فایل: در پوشه data در ریشه پروژه
// نکته: نام فایل را بدون نقطه گذاشتیم تا مطمئن شویم مشکل سطح دسترسی سیستم عامل نیست
const DB_FILE = "product-resources.json"; 
const DB_PATH = path.resolve(process.cwd(), ".data", DB_FILE);

// --- توابع کمکی ---

// تابع کمکی برای تنظیم هدرهای CORS
function setCorsHeaders(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

// اطمینان از وجود پوشه data
async function ensureDataDir() {
    const dir = path.dirname(DB_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function readDb() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    // اگر فایل نبود، یک آبجکت خالی برگردان
    return { specs: [], sizes: [] };
  }
}

async function writeDb(data: any) {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// --- هندلرها ---

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  try {
      const type = req.query.type as string;
      const db = await readDb();
      
      if (type === "specs") res.json({ data: db.specs || [] });
      else if (type === "sizes") res.json({ data: db.sizes || [] });
      else res.status(400).json({ message: "Invalid type" });
  } catch (e: any) {
      console.error("GET Error:", e);
      res.status(500).json({ message: e.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  try {
      const { type, title, data } = req.body as any;

      if (!title || !data) throw new Error("Missing title or data");

      const db = await readDb();
      const newItem = { 
          id: Date.now().toString(), 
          title, 
          ...(type === "specs" ? { fields: data } : { image_url: data }) 
      };

      if (!db[type]) db[type] = [];
      db[type].push(newItem);

      await writeDb(db);
      res.json({ message: "Created", item: newItem });
  } catch (e: any) {
      console.error("POST Error:", e); // این خط خطا را در ترمینال سرور چاپ می‌کند
      res.status(500).json({ message: e.message });
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  try {
      const { id, type, title, data } = req.body as any;
      const db = await readDb();
      
      if (!db[type]) db[type] = [];
      const index = db[type].findIndex((i: any) => i.id === id);

      if (index === -1) {
          res.status(404).json({ message: "Item not found" });
          return;
      }

      db[type][index] = { 
          ...db[type][index], 
          title, 
          ...(type === "specs" ? { fields: data } : { image_url: data }) 
      };

      await writeDb(db);
      res.json({ message: "Updated", item: db[type][index] });
  } catch (e: any) {
      console.error("PUT Error:", e);
      res.status(500).json({ message: e.message });
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  setCorsHeaders(req, res);
  try {
      const { id, type } = req.body as any;
      const db = await readDb();
      
      if (!db[type]) db[type] = [];
      db[type] = db[type].filter((i: any) => i.id !== id);

      await writeDb(db);
      res.json({ message: "Deleted" });
  } catch (e: any) {
      console.error("DELETE Error:", e);
      res.status(500).json({ message: e.message });
  }
}