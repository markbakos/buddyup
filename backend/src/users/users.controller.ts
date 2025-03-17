import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'
import { User } from './user.entity'
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import { ExpressRequest } from '../auth/types/express-request.interface'

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.createUser(
            createUserDto.email,
            createUserDto.password,
            createUserDto.name,
        )
    }

    @Get('user')
    async findUserById(@Body() body: {userId: string}): Promise<User> {
        return this.usersService.findOneById(body.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('current')
    async getCurrentUser(@Req() req: ExpressRequest): Promise<User> {
        const userId = req.user.id;
        return this.usersService.findOneById(userId);
    }
}