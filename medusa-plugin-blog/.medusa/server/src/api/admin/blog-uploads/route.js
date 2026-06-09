"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UPLOAD_DIR = path_1.default.resolve(process.cwd(), ".uploads", "blog");
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
async function POST(req, res) {
    upload.array("files")(req, res, (err) => {
        if (err) {
            res.status(500).json({ message: "Upload failed", error: err.message });
            return;
        }
        const files = req.files;
        if (!files?.length) {
            res.status(400).json({ message: "No files uploaded" });
            return;
        }
        const uploads = files.map((file) => ({
            url: `/store/blog-uploads/${file.filename}`,
            filename: file.filename,
        }));
        res.json({ uploads });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2Jsb2ctdXBsb2Fkcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQXNCQSxvQkFxQkM7QUExQ0Qsb0RBQTJCO0FBQzNCLDRDQUFtQjtBQUNuQixnREFBdUI7QUFFdkIsTUFBTSxVQUFVLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBRWxFLElBQUksQ0FBQyxZQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7SUFDL0IsWUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUMvQyxDQUFDO0FBRUQsTUFBTSxPQUFPLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7SUFDakMsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDO0lBQ3RELFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDM0IsTUFBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQTtRQUNqRSxNQUFNLEdBQUcsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUMzQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDN0IsQ0FBQztDQUNGLENBQUMsQ0FBQTtBQUVGLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFFM0IsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzdFLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBVSxFQUFFLEdBQVUsRUFBRSxDQUFDLEdBQVEsRUFBRSxFQUFFO1FBQ3pELElBQUksR0FBRyxFQUFFLENBQUM7WUFDUixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1lBQ3RFLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQUksR0FBVyxDQUFDLEtBQTBDLENBQUE7UUFFckUsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUE7WUFDdEQsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLEdBQUcsRUFBRSx1QkFBdUIsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUMzQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQyxDQUFDLENBQUE7UUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN2QixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMifQ==