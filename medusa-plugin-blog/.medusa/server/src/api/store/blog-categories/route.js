"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const db_1 = require("../../../lib/db");
async function GET(req, res) {
    try {
        const knex = (0, db_1.resolveKnex)(req.scope);
        const categories = await knex("blog_categories").select("*");
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching categories",
            error: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2ctY2F0ZWdvcmllcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQVdDO0FBYkQsd0NBQTZDO0FBRXRDLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxJQUFJLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFXLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ25DLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSwyQkFBMkI7WUFDcEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPO1NBQ3JCLENBQUMsQ0FBQTtJQUNKLENBQUM7QUFDSCxDQUFDIn0=