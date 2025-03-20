import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { ProfileController } from './profile.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserProfile])],
    controllers: [UsersController, ProfileController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}