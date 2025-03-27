import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string): Promise<User> {
        const user = await this.usersService.findOneByEmail(email)
        if (user && await bcrypt.compare(pass, user.password)) {
            return user;
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(user: User) {
        if (!user || !user.id) {
            throw new UnauthorizedException('Unable to generate token - invalid user');
        }
        
        const payload = { email: user.email, sub: user.id };
        
        const token = this.jwtService.sign(payload);
        
        return {
            access_token: token,
        }
    }
}