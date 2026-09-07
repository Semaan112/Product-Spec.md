import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { TicketsService, TicketStatus } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get(':id')
  getTicket(@Param('id') id: string) {
    return this.ticketsService.getTicket(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') newStatus: TicketStatus,
  ) {
    return this.ticketsService.updateStatus(id, newStatus);
  }
}
