import { IsEnum } from 'class-validator';
import { TicketApprovalAction } from '../enums/ticket-approval-action.enum';

export class UpdateTicketApprovalDto {
  @IsEnum(TicketApprovalAction)
  action!: TicketApprovalAction;
}
