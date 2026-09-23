import { BadRequestException } from '@nestjs/common';
import { RequestCategory } from '../request-intake/enums/request-category.enum';
import { RequestPriority } from '../request-intake/enums/request-priority.enum';
import { TicketsService } from './tickets.service';
import { TicketApprovalAction } from './enums/ticket-approval-action.enum';
import { TicketApprovalStatus } from './enums/ticket-approval-status.enum';
import { TicketStatus } from './enums/ticket-status.enum';

describe('TicketsService - Business Rules', () => {
  const service = new TicketsService();

  it('should throw BadRequestException when trying to update a RESOLVED ticket', () => {
    service.updateStatus('TCK-101', TicketStatus.IN_PROGRESS);
    service.updateStatus('TCK-101', TicketStatus.RESOLVED);
    expect(() => service.updateStatus('TCK-101', TicketStatus.IN_PROGRESS))
      .toThrow(BadRequestException);
  });

  it('should create a ticket with intake metadata and pending approval', () => {
    const service = new TicketsService();
    const ticket = service.create({
      title: 'Laptop for new starter',
      summary: 'A laptop is needed for a new team member starting next Monday.',
      category: RequestCategory.IT,
      priority: RequestPriority.HIGH,
      needsApproval: true,
      approvalReason: 'Hardware requests require manager approval.',
      requester: 'requester-001',
      classificationReasons: ['Matched IT service language in the request.'],
      classificationSignals: ['laptop'],
    });

    expect(ticket.id).toBe('TCK-102');
    expect(ticket.priority).toBe(RequestPriority.HIGH);
    expect(ticket.approvalStatus).toBe(TicketApprovalStatus.PENDING);
    expect(ticket.classificationSignals).toEqual(['laptop']);

    expect(service.updateApproval(ticket.id, TicketApprovalAction.APPROVE).approvalStatus)
      .toBe(TicketApprovalStatus.APPROVED);
    expect(service.updateStatus(ticket.id, TicketStatus.IN_PROGRESS).status)
      .toBe(TicketStatus.IN_PROGRESS);
  });

  it('should reject pending work and block status changes', () => {
    const service = new TicketsService();
    const ticket = service.create({
      title: 'Purchase request',
      summary: 'Please purchase the approved equipment for the new team.',
      category: RequestCategory.IT,
      priority: RequestPriority.NORMAL,
      needsApproval: true,
    });

    expect(service.updateApproval(ticket.id, TicketApprovalAction.REJECT).approvalStatus)
      .toBe(TicketApprovalStatus.REJECTED);
    expect(() => service.updateStatus(ticket.id, TicketStatus.IN_PROGRESS))
      .toThrow(BadRequestException);
  });

  it('should allow an open ticket without approval to be rejected', () => {
    const service = new TicketsService();

    expect(service.updateApproval('TCK-101', TicketApprovalAction.REJECT).approvalStatus)
      .toBe(TicketApprovalStatus.REJECTED);
    expect(() => service.updateStatus('TCK-101', TicketStatus.IN_PROGRESS))
      .toThrow(BadRequestException);
  });

  it('should return the live queue with urgent work first', () => {
    const service = new TicketsService();
    service.create({
      title: 'Routine facilities request',
      summary: 'Please arrange a replacement chair for the meeting room.',
      category: RequestCategory.FACILITIES,
      priority: RequestPriority.LOW,
      needsApproval: false,
    });
    service.create({
      title: 'Critical access outage',
      summary: 'The on-call team cannot access the production console.',
      category: RequestCategory.ACCESS,
      priority: RequestPriority.URGENT,
      needsApproval: false,
    });

    expect(service.findAll().map((ticket) => ticket.priority)).toEqual([
      RequestPriority.URGENT,
      'NORMAL',
      RequestPriority.LOW,
    ]);
  });
});