import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface InternalTicket {
  id: string;
  department: 'IT' | 'HR' | 'FACILITIES';
  requester_id: string;
  assigned_agent_id?: string;
  status: TicketStatus;
  updatedAt: Date;
}

@Injectable()
export class TicketsService {
  private tickets: Map<string, InternalTicket> = new Map([
    [
      'TCK-101',
      {
        id: 'TCK-101',
        department: 'IT',
        requester_id: 'USER-001',
        assigned_agent_id: 'AGENT-007',
        status: 'OPEN',
        updatedAt: new Date(),
      },
    ],
  ]);

  getTicket(id: string): InternalTicket {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket ID ${id} not found.`);
    }
    return ticket;
  }

  updateStatus(id: string, newStatus: TicketStatus): InternalTicket {
    const ticket = this.getTicket(id);

    if (ticket.status === 'RESOLVED') {
      throw new BadRequestException('Invariant Violation: Resolved tickets cannot change status or be reopened.');
    }

    const isValidTransition =
      (ticket.status === 'OPEN' && newStatus === 'IN_PROGRESS') ||
      (ticket.status === 'IN_PROGRESS' && newStatus === 'RESOLVED');

    if (!isValidTransition) {
      throw new BadRequestException(`Invalid state transition from ${ticket.status} to ${newStatus}.`);
    }

    ticket.status = newStatus;
    ticket.updatedAt = new Date();
    this.tickets.set(id, ticket);

    return ticket;
  }
}