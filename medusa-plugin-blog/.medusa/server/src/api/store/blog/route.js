"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const blog_service_1 = require("../../../lib/blog-service");
const db_1 = require("../../../lib/db");
async function GET(req, res) {
    try {
        const blogService = new blog_service_1.BlogService((0, db_1.resolveKnex)(req.scope));
        const posts = await blogService.list({ status: "published" });
        res.json({ posts });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching blog posts",
            error: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2cvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFXQztBQWRELDREQUF1RDtBQUN2RCx3Q0FBNkM7QUFFdEMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLElBQUksMEJBQVcsQ0FBQyxJQUFBLGdCQUFXLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7UUFDN0QsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDckIsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsT0FBTyxFQUFFLDJCQUEyQjtZQUNwQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU87U0FDckIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMifQ==