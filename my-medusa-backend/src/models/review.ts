import { 
  BeforeInsert, 
  Column, 
  Entity, 
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm"
import { generateEntityId } from "@medusajs/utils"

@Entity()
export class Review {
  // --- فیلدهای پایه (جایگزین BaseEntity) ---
  @PrimaryColumn()
  id: string

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date
  // ---------------------------------------

  @Column({ type: "varchar" })
  name: string

  @Column({ type: "varchar" })
  role: string

  @Column({ type: "text" })
  content: string

  @Column({ type: "int" })
  rating: number

  // nullable: true یعنی این فیلد اجباری نیست
  @Column({ type: "varchar", nullable: true })
  image: string | null

  @BeforeInsert()
  private beforeInsert(): void {
    // اگر آیدی نداشت، بساز (با پیشوند review_)
    if (!this.id) {
      this.id = generateEntityId(this.id, "review")
    }
  }
}