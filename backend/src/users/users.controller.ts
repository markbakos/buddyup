import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('register')
    async registerUser(
        @Body() body: { email: string; password: string; name: string;}
    ): Promise<User> {
        const { email, password, name } = body;
        return this.usersService.createUser(email, password, name);
    }
}