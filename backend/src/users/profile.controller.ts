import { Controller, Get, Put, UseGuards, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private usersService: UsersService) {}

    @Get()
    async getProfile(@GetUser('userId') userId: string) {
        const [user, profile] = await Promise.all([
            this.usersService.getUserWithStats(userId),
            this.usersService.getProfile(userId)
        ]);

        return {
            ...user,
            profile
        };
    }

    @Put()
    async updateProfile(
        @GetUser('userId') userId: string,
        @Body() updateProfileDto: UpdateProfileDto
    ) {
        return this.usersService.updateProfile(userId, updateProfileDto);
    }

    @Get(':id')
    async getPublicProfile(@Param('id') userId: string) {
        const [user, profile] = await Promise.all([
            this.usersService.getUserWithStats(userId),
            this.usersService.getProfile(userId)
        ]);

        return {
            ...user,
            profile
        };
    }
} 