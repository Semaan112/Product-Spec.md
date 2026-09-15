import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TicketStatus } from '../enums/ticket-status.enum';

@Entity()
export class Ticket {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  title!: string;

  @Column()
  status!: TicketStatus;

  @Column({ type: 'datetime', nullable: true })
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedAt!: Date;
}
