import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewCreate1680000000000 implements MigrationInterface { 
    // عدد جلوی نام کلاس مهم نیست، اگر ادیتور خطا داد نام کلاس را با نام فایل یکی کنید
    name = 'ReviewCreate1680000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "review" (
                "id" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "role" character varying NOT NULL,
                "content" text NOT NULL,
                "rating" integer NOT NULL,
                "image" character varying,
                CONSTRAINT "PK_review_id" PRIMARY KEY ("id")
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "review"`);
    }
}