import { Expose, Transform, Type } from 'class-transformer';

export class UserInfoDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  jobTitle: string;
}

export class FeedPostDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserInfoDto)
  user: UserInfoDto;

  @Expose()
  likesCount: number;

  @Expose()
  currentUserLiked?: boolean;

  @Expose()
  @Transform(({ value }) => new Date(value).toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => new Date(value).toISOString())
  updatedAt: Date;
} 