import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/utils";

// هندلر OPTIONS را هم پاک کردیم چون میدل‌ور انجامش می‌دهد

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any;

  try {
    const attributes = await knex("global_attributes").select("*");
    for (const attr of attributes) {
      attr.values = await knex("global_attribute_values").where({ attribute_id: attr.id });
    }
    res.json({ attributes });
  } catch (error: any) {
    console.error("GET Error:", error);
    res.json({ attributes: [] });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { title, values } = req.body as any;
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any;
  const attrId = `attr_${Date.now()}`;
  
  try {
    await knex.transaction(async (trx: any) => {
      await trx("global_attributes").insert({
        id: attrId,
        title: title,
        handle: title.toLowerCase().replace(/\s+/g, "-"),
      });

      if (values && values.length > 0) {
        const valueInserts = values.map((v: string) => ({
          id: `val_${Math.floor(Math.random() * 100000000)}`,
          attribute_id: attrId,
          value: v
        }));
        await trx("global_attribute_values").insert(valueInserts);
      }
    });
    res.json({ message: "Created", id: attrId });
  } catch (error: any) {
    console.error("POST Error:", error);
    res.status(500).json({ message: error.message });
  }
}