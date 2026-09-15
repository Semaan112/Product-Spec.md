import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return await this.ticketsService.updateStatus(id, dto.status);
  }
}