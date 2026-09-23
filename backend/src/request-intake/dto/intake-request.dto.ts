import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { RequestCategory } from '../enums/request-category.enum';

export class IntakeRequestDto {
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  text!: string;

  @IsOptional()
  @IsEnum(RequestCategory)
  category?: RequestCategory;
}