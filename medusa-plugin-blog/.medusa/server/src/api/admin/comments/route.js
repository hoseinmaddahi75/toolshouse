"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const comment_service_1 = require("../../../lib/comment-service");
const db_1 = require("../../../lib/db");
async function GET(req, res) {
    const commentService = new comment_service_1.CommentService((0, db_1.resolveKnex)(req.scope));
    const comments = await commentService.listAll();
    res.json({ comments });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2NvbW1lbnRzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsa0JBSUM7QUFQRCxrRUFBNkQ7QUFDN0Qsd0NBQTZDO0FBRXRDLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM1RSxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsSUFBQSxnQkFBVyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLE1BQU0sUUFBUSxHQUFHLE1BQU0sY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3hCLENBQUMifQ==