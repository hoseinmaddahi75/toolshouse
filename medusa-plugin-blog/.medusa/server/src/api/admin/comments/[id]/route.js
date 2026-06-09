"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const comment_service_1 = require("../../../../lib/comment-service");
const db_1 = require("../../../../lib/db");
async function PUT(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const commentService = new comment_service_1.CommentService((0, db_1.resolveKnex)(req.scope));
    try {
        const updated = await commentService.updateStatus(id, status);
        res.json({ comment: updated[0] });
    }
    catch {
        res.status(500).json({ message: "Error updating comment" });
    }
}
async function DELETE(req, res) {
    const { id } = req.params;
    const commentService = new comment_service_1.CommentService((0, db_1.resolveKnex)(req.scope));
    try {
        await commentService.delete(id);
        res.json({ message: "Comment deleted" });
    }
    catch {
        res.status(500).json({ message: "Error deleting comment" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2NvbW1lbnRzL1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFXQztBQUVELHdCQVVDO0FBMUJELHFFQUFnRTtBQUNoRSwyQ0FBZ0Q7QUFFekMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFBO0lBQ3pCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBMEMsQ0FBQTtJQUNqRSxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsSUFBQSxnQkFBVyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRWpFLElBQUksQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDN0QsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFBQyxNQUFNLENBQUM7UUFDUCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztBQUNILENBQUM7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDL0UsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLElBQUEsZ0JBQVcsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUVqRSxJQUFJLENBQUM7UUFDSCxNQUFNLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUE7SUFDMUMsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0FBQ0gsQ0FBQyJ9