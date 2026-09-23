import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketApprovalDto } from './dto/update-ticket-approval.dto';
import { TicketsService } from './tickets.service';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Post()
  create(@Body() request: CreateTicketDto) {
    return this.ticketsService.create(request);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return await this.ticketsService.updateStatus(id, dto.status);
  }

  @Patch(':id/approval')
  @UseGuards(RolesGuard)
  updateApproval(
    @Param('id') id: string,
    @Body() dto: UpdateTicketApprovalDto,
  ) {
    return this.ticketsService.updateApproval(id, dto.action);
  }
}