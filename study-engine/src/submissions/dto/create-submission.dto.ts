import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSubmissionDto {
  // DSA / coding answer
  @IsOptional()
  @IsString()
  answerText?: string;

  // system-design diagram (React Flow nodes + edges)
  @IsOptional()
  @IsObject()
  diagram?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;

  // self-assessed confidence 0-5 → drives spaced repetition
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  selfGrade?: number;

  @IsOptional()
  @IsString()
  userEmail?: string;
}
