import { BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketStatus } from './enums/ticket-status.enum';

describe('TicketsService - Business Rules', () => {
  const service = new TicketsService();

  it('should throw BadRequestException when trying to update a RESOLVED ticket', () => {
    service.updateStatus('TCK-101', TicketStatus.IN_PROGRESS);
    service.updateStatus('TCK-101', TicketStatus.RESOLVED);
    expect(() => service.updateStatus('TCK-101', TicketStatus.IN_PROGRESS))
      .toThrow(BadRequestException);
  });
});