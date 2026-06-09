"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const blog_service_1 = require("../../../../lib/blog-service");
const db_1 = require("../../../../lib/db");
async function GET(req, res) {
    const { slug } = req.params;
    try {
        const blogService = new blog_service_1.BlogService((0, db_1.resolveKnex)(req.scope));
        const post = await blogService.retrieveBySlug(slug);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.json({ post });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching post", error: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2cvW3NsdWddL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsa0JBZ0JDO0FBbkJELCtEQUEwRDtBQUMxRCwyQ0FBZ0Q7QUFFekMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFBO0lBRTNCLElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLElBQUksMEJBQVcsQ0FBQyxJQUFBLGdCQUFXLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDM0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRW5ELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNWLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtZQUNuRCxPQUFNO1FBQ1IsQ0FBQztRQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3BCLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNoRixDQUFDO0FBQ0gsQ0FBQyJ9