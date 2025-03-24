import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
    @Expose()
    id: string;

    @Expose()
    email: string;

    @Expose()
    name: string;

    @Expose()
    jobTitle: string;

    @Expose()
    shortBio: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
} 