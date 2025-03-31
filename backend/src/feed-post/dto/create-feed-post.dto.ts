import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Feed post cannot exceed 500 characters' })
  content: string;
} 