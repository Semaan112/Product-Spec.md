import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '../enums/ticket-status.enum';

export class UpdateTicketStatusDto {
  @IsNotEmpty()
  @IsEnum(TicketStatus, { message: 'Invalid ticket status provided.' })
  status!: TicketStatus;
}