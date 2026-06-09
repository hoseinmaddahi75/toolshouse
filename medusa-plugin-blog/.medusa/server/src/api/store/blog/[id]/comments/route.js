"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const comment_service_1 = require("../../../../../lib/comment-service");
const db_1 = require("../../../../../lib/db");
async function GET(req, res) {
    const { id } = req.params;
    const commentService = new comment_service_1.CommentService((0, db_1.resolveKnex)(req.scope));
    const comments = await commentService.listByPost(id);
    res.json({ comments });
}
async function POST(req, res) {
    const { id } = req.params;
    const commentService = new comment_service_1.CommentService((0, db_1.resolveKnex)(req.scope));
    try {
        const body = req.body;
        const comment = await commentService.create({
            post_id: id,
            author_name: body.author_name,
            content: body.content,
        });
        res.json({ comment });
    }
    catch {
        res.status(500).json({ message: "Error creating comment" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2cvW2lkXS9jb21tZW50cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtCQUtDO0FBRUQsb0JBZUM7QUF6QkQsd0VBQW1FO0FBQ25FLDhDQUFtRDtBQUU1QyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLElBQUEsZ0JBQVcsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNqRSxNQUFNLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDeEIsQ0FBQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQTtJQUN6QixNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsSUFBQSxnQkFBVyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRWpFLElBQUksQ0FBQztRQUNILE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFnRCxDQUFBO1FBQ2pFLE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUMxQyxPQUFPLEVBQUUsRUFBRTtZQUNYLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDdEIsQ0FBQyxDQUFBO1FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0FBQ0gsQ0FBQyJ9