import { RequestCategory } from '../enums/request-category.enum';
import { RequestPriority } from '../enums/request-priority.enum';

export interface IntakeContext {
  categories: RequestCategory[];
  priorities: RequestPriority[];
}

export interface IntakeCandidate {
  title: string;
  summary: string;
  category: RequestCategory;
  priority: RequestPriority;
  confidence: number;
  needsApproval: boolean;
  approvalReason?: string;
  missingInformation: string[];
  reasons?: string[];
  signals?: string[];
}

export interface IntakeProvider {
  classify(text: string, context: IntakeContext): Promise<IntakeCandidate>;
}