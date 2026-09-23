import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { IntakeRequestDto } from './dto/intake-request.dto';
import { RequestCategory } from './enums/request-category.enum';
import { RequestPriority } from './enums/request-priority.enum';
import { IntakeCandidate, IntakeContext, IntakeProvider } from './interfaces/intake-provider.interface';

export const INTAKE_PROVIDER = Symbol('INTAKE_PROVIDER');

@Injectable()
export class RequestIntakeService {
  private readonly context: IntakeContext = {
    categories: Object.values(RequestCategory),
    priorities: Object.values(RequestPriority),
  };

  constructor(@Inject(INTAKE_PROVIDER) private readonly provider: IntakeProvider) {}

  async classify(request: IntakeRequestDto): Promise<{ candidate: IntakeCandidate; advisory: string }> {
    try {
      const candidate = await this.provider.classify(request.text, this.context);
      const validated = this.validateCandidate(candidate, request.category);
      return {
        candidate: validated,
        advisory: 'AI suggestion only. Review the request before routing or approving it.',
      };
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException('Request classification is temporarily unavailable. Please submit the request manually.');
    }
  }

  private validateCandidate(candidate: IntakeCandidate, requestedCategory?: RequestCategory): IntakeCandidate {
    if (!Object.values(RequestCategory).includes(candidate.category)
      || !Object.values(RequestPriority).includes(candidate.priority)
      || candidate.confidence < 0 || candidate.confidence > 1
      || !candidate.title.trim() || !candidate.summary.trim()
      || (candidate.reasons && (!Array.isArray(candidate.reasons) || candidate.reasons.some((reason) => !reason.trim())))
      || (candidate.signals && (!Array.isArray(candidate.signals) || candidate.signals.some((signal) => !signal.trim())))) {
      throw new BadGatewayException('The classification provider returned an invalid request result.');
    }

    return requestedCategory ? { ...candidate, category: requestedCategory, confidence: Math.max(candidate.confidence, 0.8) } : candidate;
  }
}