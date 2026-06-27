import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewDto {
  // 0-5 confidence; <3 resets the interval (SM-2)
  @IsInt()
  @Min(0)
  @Max(5)
  grade!: number;

  @IsOptional()
  @IsString()
  user?: string;
}
