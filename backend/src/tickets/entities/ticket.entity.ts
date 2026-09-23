import { Column, Entity, PrimaryColumn } from 'typeorm';
import { RequestCategory } from '../../request-intake/enums/request-category.enum';
import { RequestPriority } from '../../request-intake/enums/request-priority.enum';
import { TicketApprovalStatus } from '../enums/ticket-approval-status.enum';
import { TicketStatus } from '../enums/ticket-status.enum';

@Entity()
export class Ticket {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({ nullable: true })
  category?: RequestCategory;

  @Column({ nullable: true })
  priority?: RequestPriority;

  @Column({ nullable: true })
  requester?: string;

  @Column({ nullable: true })
  approvalReason?: string;

  @Column({ nullable: true })
  approvalStatus?: TicketApprovalStatus;

  @Column({ type: 'simple-json', nullable: true })
  classificationReasons?: string[];

  @Column({ type: 'simple-json', nullable: true })
  classificationSignals?: string[];

  @Column()
  status!: TicketStatus;

  @Column({ type: 'datetime', nullable: true })
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedAt!: Date;
}
