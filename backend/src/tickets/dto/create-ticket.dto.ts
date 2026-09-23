import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { RequestCategory } from '../../request-intake/enums/request-category.enum';
import { RequestPriority } from '../../request-intake/enums/request-priority.enum';

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  summary!: string;

  @IsEnum(RequestCategory)
  category!: RequestCategory;

  @IsEnum(RequestPriority)
  priority!: RequestPriority;

  @IsBoolean()
  needsApproval!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  approvalReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  requester?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  classificationReasons?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  classificationSignals?: string[];
}
