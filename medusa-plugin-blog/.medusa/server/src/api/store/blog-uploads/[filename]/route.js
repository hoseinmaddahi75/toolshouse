"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UPLOAD_DIR = path_1.default.resolve(process.cwd(), ".uploads", "blog");
const MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
};
async function GET(req, res) {
    const { filename } = req.params;
    const filePath = path_1.default.resolve(UPLOAD_DIR, filename);
    if (!filePath.startsWith(UPLOAD_DIR) || !fs_1.default.existsSync(filePath)) {
        res.status(404).json({ message: "File not found" });
        return;
    }
    const ext = path_1.default.extname(filename).toLowerCase();
    res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    fs_1.default.createReadStream(filePath).pipe(res);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2ctdXBsb2Fkcy9bZmlsZW5hbWVdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBY0Esa0JBYUM7QUExQkQsNENBQW1CO0FBQ25CLGdEQUF1QjtBQUV2QixNQUFNLFVBQVUsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFFbEUsTUFBTSxVQUFVLEdBQTJCO0lBQ3pDLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLE1BQU0sRUFBRSxXQUFXO0NBQ3BCLENBQUE7QUFFTSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDL0IsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFFbkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDakUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFBO1FBQ25ELE9BQU07SUFDUixDQUFDO0lBRUQsTUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNoRCxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksMEJBQTBCLENBQUMsQ0FBQTtJQUM1RSxHQUFHLENBQUMsU0FBUyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELFlBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVSxDQUFDLENBQUE7QUFDaEQsQ0FBQyJ9