"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const blog_service_1 = require("../../../lib/blog-service");
const db_1 = require("../../../lib/db");
async function GET(req, res) {
    const blogService = new blog_service_1.BlogService((0, db_1.resolveKnex)(req.scope));
    const posts = await blogService.list();
    res.json({ posts });
}
async function POST(req, res) {
    const blogService = new blog_service_1.BlogService((0, db_1.resolveKnex)(req.scope));
    try {
        const post = await blogService.create(req.body);
        res.status(201).json({ post });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2Jsb2cvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFJQztBQUVELG9CQVNDO0FBbEJELDREQUF1RDtBQUN2RCx3Q0FBNkM7QUFFdEMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sV0FBVyxHQUFHLElBQUksMEJBQVcsQ0FBQyxJQUFBLGdCQUFXLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDdEMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDckIsQ0FBQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM3RSxNQUFNLFdBQVcsR0FBRyxJQUFJLDBCQUFXLENBQUMsSUFBQSxnQkFBVyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRTNELElBQUksQ0FBQztRQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBVyxDQUFDLENBQUE7UUFDdEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNoRixDQUFDO0FBQ0gsQ0FBQyJ9