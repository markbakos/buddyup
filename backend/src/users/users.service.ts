import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(UserProfile)
        private profileRepository: Repository<UserProfile>
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

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOneById(userId);
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async getProfile(userId: string): Promise<UserProfile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!profile) {
            const user = await this.findOneById(userId);
            const newProfile = this.profileRepository.create({ user });
            return this.profileRepository.save(newProfile);
        }

        const { password, ...userWithoutPassword } = profile.user;
        profile.user = userWithoutPassword as User;

        return profile;
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfile> {
        let profile = await this.getProfile(userId);
        Object.assign(profile, updateProfileDto);
        return this.profileRepository.save(profile);
    }

    async getUserWithStats(userId: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['ads'],
            select: ['id', 'name', 'email', 'jobTitle', 'shortBio', 'createdAt', 'updatedAt']
        });

        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        return user;
    }
}
