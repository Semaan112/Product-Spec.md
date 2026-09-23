import { BadGatewayException } from '@nestjs/common';
import { RequestCategory } from './enums/request-category.enum';
import { RequestPriority } from './enums/request-priority.enum';
import { IntakeProvider } from './interfaces/intake-provider.interface';
import { RequestIntakeService } from './request-intake.service';

describe('RequestIntakeService', () => {
  const provider: IntakeProvider = {
    classify: jest.fn(async (text) => ({
      title: 'IT request',
      summary: text,
      category: RequestCategory.IT,
      priority: RequestPriority.NORMAL,
      confidence: 0.8,
      needsApproval: false,
      missingInformation: [],
    })),
  };

  it.each([
    ['laptop request', 'I need a new laptop for onboarding next Monday.', RequestCategory.IT, RequestPriority.NORMAL],
    ['urgent access', 'I am blocked and need permission for the finance app today.', RequestCategory.ACCESS, RequestPriority.HIGH],
    ['facilities request', 'Please repair the chair in my office this week.', RequestCategory.FACILITIES, RequestPriority.NORMAL],
    ['hr request', 'Can you explain the parental leave policy by Friday?', RequestCategory.HR, RequestPriority.NORMAL],
    ['salary request', 'I have a question about my salary for this month.', RequestCategory.HR, RequestPriority.NORMAL],
    ['compensation request', 'My compensation statement needs clarification.', RequestCategory.HR, RequestPriority.NORMAL],
    ['approval request', 'Please purchase a new computer for my team.', RequestCategory.IT, RequestPriority.NORMAL],
  ])('classifies %s into a bounded structured result', async (_name, text, category, priority) => {
    const result = await new (await import('./providers/deterministic-intake.provider')).DeterministicIntakeProvider()
      .classify(text, { categories: Object.values(RequestCategory), priorities: Object.values(RequestPriority) });

    expect(result.category).toBe(category);
    expect(result.priority).toBe(priority);
    expect(result.title).toContain(category);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.reasons?.length).toBeGreaterThan(0);
  });

  it('preserves an explicit product category over the advisory suggestion', async () => {
    const result = await new RequestIntakeService(provider).classify({
      text: 'I need a laptop for next week.',
      category: RequestCategory.ACCESS,
    });

    expect(result.candidate.category).toBe(RequestCategory.ACCESS);
    expect(result.advisory).toContain('AI suggestion only');
  });

  it('rejects invalid provider output', async () => {
    const invalidProvider: IntakeProvider = {
      classify: jest.fn(async () => ({ ...await provider.classify('x', { categories: [], priorities: [] }), confidence: 2 })),
    };

    await expect(new RequestIntakeService(invalidProvider).classify({ text: 'A valid request description.' }))
      .rejects.toThrow(BadGatewayException);
  });

  it('turns provider failure into a safe retryable API error', async () => {
    const failedProvider: IntakeProvider = {
      classify: jest.fn(async () => { throw new Error('provider offline'); }),
    };

    await expect(new RequestIntakeService(failedProvider).classify({ text: 'A valid request description.' }))
      .rejects.toThrow('Request classification is temporarily unavailable');
  });

  it('explains salary classification with matched evidence', async () => {
    const result = await new (await import('./providers/deterministic-intake.provider')).DeterministicIntakeProvider()
      .classify('I have a question about my salary for this month.', { categories: Object.values(RequestCategory), priorities: Object.values(RequestPriority) });

    expect(result.category).toBe(RequestCategory.HR);
    expect(result.reasons).toContain('Matched HR service language in the request.');
    expect(result.signals).toContain('salary');
  });
});