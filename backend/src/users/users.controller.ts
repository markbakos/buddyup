import { Body, Controller, Post } from '@nestjs/common'
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
}