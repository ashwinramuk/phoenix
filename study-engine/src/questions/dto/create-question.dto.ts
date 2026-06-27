import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsInt()
  topicId!: number;

  @IsIn(['coding', 'system-design', 'mcq'])
  type!: 'coding' | 'system-design' | 'mcq';

  @IsString()
  title!: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];

  @IsOptional()
  @IsString()
  referenceSolution?: string;
}
