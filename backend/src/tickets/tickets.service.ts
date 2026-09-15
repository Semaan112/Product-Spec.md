import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './enums/ticket-status.enum';

@Injectable()
export class TicketsService {
  private readonly tickets = new Map<string, Ticket>([
    [
      'TCK-101',
      {
        id: 'TCK-101',
        title: 'System access issue',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  ]);

  findOne(id: string): Ticket {
    const ticket = this.tickets.get(id);

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" was not found.`);
    }

    return ticket;
  }

  create(title: string): Ticket {
    const id = `TCK-${this.tickets.size + 101}`;
    const ticket: Ticket = {
      id,
      title,
      status: TicketStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(id, ticket);
    return ticket;
  }

  updateStatus(id: string, status: TicketStatus): Ticket {
    const ticket = this.findOne(id);

    const currentIndex = Object.values(TicketStatus).indexOf(ticket.status);
    const nextIndex = Object.values(TicketStatus).indexOf(status);

    if (currentIndex === -1 || nextIndex === -1) {
      throw new BadRequestException('Invalid ticket status transition.');
    }

    if (ticket.status === TicketStatus.RESOLVED) {
      throw new BadRequestException('Invariant Violation: Resolved tickets cannot change status or be reopened.');
    }

    if (nextIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Invalid state transition from ${ticket.status} to ${status}`,
      );
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    return ticket;
  }
}