import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async createUser(email: string, password: string, name: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({email, password: hashedPassword, name});
        return this.usersRepository.save(user);
    }

    async findOneByEmail(email:string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {email} });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    async findOneById(id: string): Promise<User>{
        const user = await this.usersRepository.findOne({
            where: {id},
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt']
        });

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user
    }
}
