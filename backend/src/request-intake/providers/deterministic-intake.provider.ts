import { Injectable } from '@nestjs/common';
import { RequestCategory } from '../enums/request-category.enum';
import { RequestPriority } from '../enums/request-priority.enum';
import { IntakeCandidate, IntakeContext, IntakeProvider } from '../interfaces/intake-provider.interface';

const categoryKeywords: Record<RequestCategory, string[]> = {
  [RequestCategory.IT]: ['laptop', 'computer', 'printer', 'software', 'vpn', 'wifi', 'email', 'screen'],
  [RequestCategory.HR]: ['leave', 'benefit', 'payroll', 'onboarding', 'policy', 'manager'],
  [RequestCategory.FACILITIES]: ['desk', 'chair', 'badge', 'room', 'office', 'maintenance', 'building'],
  [RequestCategory.ACCESS]: ['access', 'permission', 'account', 'license', 'password', 'login'],
};

@Injectable()
export class DeterministicIntakeProvider implements IntakeProvider {
  async classify(text: string, context: IntakeContext): Promise<IntakeCandidate> {
    const normalized = text.toLowerCase();
    const category = context.categories
      .map((candidate) => ({ candidate, score: categoryKeywords[candidate].filter((word) => normalized.includes(word)).length }))
      .sort((left, right) => right.score - left.score)[0];
    const selectedCategory = category?.score ? category.candidate : RequestCategory.IT;
    const urgent = /urgent|asap|blocked|outage|cannot work|can't work/i.test(text);
    const approval = /admin|production|license|purchase|hardware|new laptop|new computer/i.test(normalized);
    const missingInformation: string[] = [];

    if (!/\b(today|tomorrow|this week|by \w+day|asap|urgent)\b/i.test(text)) {
      missingInformation.push('target timing');
    }
    if (selectedCategory === RequestCategory.ACCESS && !/\b(which|what|system|app|application)\b/i.test(text)) {
      missingInformation.push('system or application name');
    }

    return {
      title: this.titleFor(selectedCategory, text),
      summary: text.trim(),
      category: selectedCategory,
      priority: urgent ? RequestPriority.HIGH : RequestPriority.NORMAL,
      confidence: category?.score ? Math.min(0.95, 0.68 + category.score * 0.1) : 0.42,
      needsApproval: approval,
      ...(approval ? { approvalReason: 'This request may require manager or policy approval.' } : {}),
      missingInformation,
    };
  }

  private titleFor(category: RequestCategory, text: string): string {
    const firstSentence = text.trim().split(/[.!?]/)[0];
    const compact = firstSentence.length > 64 ? `${firstSentence.slice(0, 61)}...` : firstSentence;
    return `${category} request: ${compact}`;
  }
}