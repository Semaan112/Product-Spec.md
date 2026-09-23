import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketApprovalAction } from './enums/ticket-approval-action.enum';
import { TicketApprovalStatus } from './enums/ticket-approval-status.enum';
import { TicketStatus } from './enums/ticket-status.enum';

@Injectable()
export class TicketsService {
  private readonly tickets = new Map<string, Ticket>([
    [
      'TCK-101',
      {
        id: 'TCK-101',
        title: 'System access issue',
        summary: 'A team member needs access to the design workspace.',
        priority: 'NORMAL' as Ticket['priority'],
        approvalStatus: TicketApprovalStatus.NOT_REQUIRED,
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

  findAll(): Ticket[] {
    return [...this.tickets.values()].sort((left, right) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
      const leftPriority = priorityOrder[left.priority ?? 'NORMAL'];
      const rightPriority = priorityOrder[right.priority ?? 'NORMAL'];
      return leftPriority - rightPriority || left.createdAt.getTime() - right.createdAt.getTime();
    });
  }

  create(request: CreateTicketDto): Ticket {
    const id = `TCK-${this.tickets.size + 101}`;
    const ticket: Ticket = {
      id,
      title: request.title,
      summary: request.summary,
      category: request.category,
      priority: request.priority,
      requester: request.requester,
      approvalReason: request.approvalReason,
      approvalStatus: request.needsApproval ? TicketApprovalStatus.PENDING : TicketApprovalStatus.NOT_REQUIRED,
      classificationReasons: request.classificationReasons,
      classificationSignals: request.classificationSignals,
      status: TicketStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(id, ticket);
    return ticket;
  }

  updateStatus(id: string, status: TicketStatus): Ticket {
    const ticket = this.findOne(id);

    if (ticket.approvalStatus === TicketApprovalStatus.PENDING) {
      throw new BadRequestException('This ticket must be approved before work can begin.');
    }

    if (ticket.approvalStatus === TicketApprovalStatus.REJECTED) {
      throw new BadRequestException('Rejected tickets cannot be started or resolved.');
    }

    if (ticket.status === status) {
      return ticket;
    }

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

  updateApproval(id: string, action: TicketApprovalAction): Ticket {
    const ticket = this.findOne(id);

    if (action === TicketApprovalAction.APPROVE && ticket.approvalStatus !== TicketApprovalStatus.PENDING) {
      throw new BadRequestException('Only tickets awaiting approval can be approved.');
    }

    if (action === TicketApprovalAction.REJECT && ticket.status !== TicketStatus.OPEN) {
      throw new BadRequestException('Only open tickets can be rejected.');
    }

    ticket.approvalStatus = action === TicketApprovalAction.APPROVE
      ? TicketApprovalStatus.APPROVED
      : TicketApprovalStatus.REJECTED;
    ticket.updatedAt = new Date();
    return ticket;
  }
}