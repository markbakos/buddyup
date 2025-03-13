import {Body, Controller, Get, Post} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'
import { User } from './user.entity'

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
}