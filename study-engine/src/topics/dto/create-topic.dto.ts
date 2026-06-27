import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTopicDto {
  @IsIn(['dsa', 'system-design'])
  category!: 'dsa' | 'system-design';

  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
