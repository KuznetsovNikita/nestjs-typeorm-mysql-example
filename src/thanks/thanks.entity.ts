import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Thanks {

  @PrimaryColumn({ type: 'varchar', length: 23 })
  id: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  fromUserId: string | null;

  @Column({ type: 'varchar', length: 16 })
  toUserId: string;

  @Column({ type: 'text' })
  reason: string;
}