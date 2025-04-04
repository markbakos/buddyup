import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Ad} from "./ad.entity";
import {Tag} from "./tag.entity";
import {CreateAdDto} from "./dto/create-ad.dto";
import {Role} from "./role.entity";
import {AdRole} from "./ad-role.entity";
import {User} from "../users/user.entity";

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad)
        private adsRepository: Repository<Ad>,

        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,

        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,

        @InjectRepository(AdRole)
        private adRolesRepository: Repository<AdRole>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async createAd(createAdDto: CreateAdDto): Promise<Ad> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: createAdDto.userId }
            });

            if (!user) {
                throw new ForbiddenException('User not found')
            }

            const { title, summary, description, location, tags, roles, metadata, userId } = createAdDto;

            const ad = this.adsRepository.create({ title, summary, description, location, metadata, userId, user });

            if (tags && tags.length > 0) {
                ad.tags = await Promise.all(
                    tags.map(async (tagName) => {
                        let tag = await this.tagsRepository.findOne({ where: { name: tagName}});
                        if (!tag) {
                            tag = this.tagsRepository.create({name: tagName});
                            await this.tagsRepository.save(tag);
                        }
                        return tag;
                    })
                );
            }

            const savedAd = await this.adsRepository.save(ad);

            if (roles && roles.length > 0) {
                for (const roleDto of roles) {
                    let role = await this.rolesRepository.findOne({ where: { name: roleDto.name }});
                    if (!role) {
                        role = this.rolesRepository.create({ name: roleDto.name });
                        await this.rolesRepository.save(role);
                    }

                    const adRole = this.adRolesRepository.create({
                        ad: savedAd,
                        role,
                        isOpen: roleDto.isOpen !== undefined ? roleDto.isOpen : true,
                    });
                    await this.adRolesRepository.save(adRole);
                }

                return this.getAdById(savedAd.id);
            }

            return this.getAdById(savedAd.id);
        } catch (error) {
            throw new Error(`Failed to create ad: ${error.message}`);
        }
    }

    async searchAds(
        keywords?: string,
        tags?: string[],
        location?: string,
        userId?: string,
        page: number = 1,
        limit: number = 10,
        roles?: string[],
        status?: string[],
        sort?: string
    ): Promise<{ ads: Ad[], total: number, page: number, limit: number }> {
        try {
            const query = this.adsRepository.createQueryBuilder('ad')
                .leftJoinAndSelect('ad.tags', 'tag')
                .leftJoinAndSelect('ad.adRoles', 'adRole')
                .leftJoinAndSelect('adRole.role', 'role')
                .leftJoinAndSelect('ad.user', 'user')
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('ad.createdAt', 'DESC');

            if (sort) {
                const now = new Date();
                
                if (sort === 'week') {
                    const oneWeekAgo = new Date(now);
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    query.andWhere('ad.createdAt >= :oneWeekAgo', { oneWeekAgo });
                } else if (sort === 'month') {
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    query.andWhere('ad.createdAt >= :oneMonthAgo', { oneMonthAgo });
                }
            }

            if (keywords) {
                query.andWhere(
                    '(ad.title ILIKE :keywords OR ad.description ILIKE :keywords OR ad.summary ILIKE :keywords)',
                    { keywords: `%${keywords}%`}
                );
            }

            if (tags && tags.length > 0) {
                query.andWhere('tag.name IN (:...tags)', { tags });
            }

            if (roles && roles.length > 0) {
                query.andWhere('role.name IN (:...roles)', { roles });
            }

            if (status && status.length > 0) {
                const isOpen = status.includes('open');
                const isClosed = status.includes('closed');
                
                if (isOpen && !isClosed) {
                    query.andWhere('adRole.isOpen = :isOpen', { isOpen: true });
                } else if (!isOpen && isClosed) {
                    query.andWhere('adRole.isOpen = :isOpen', { isOpen: false });
                }
            }

            if (location) {
                query.andWhere('ad.location ILIKE :location', { location: `%${location}%` });
            }

            if (userId) {
                query.andWhere('ad.userId = :userId', { userId });
            }

            const [ads, total] = await query.getManyAndCount();

            if (!ads || ads.length === 0) {
                throw new NotFoundException('No ads found matching criteria');
            }

            return {
                ads,
                total,
                page,
                limit
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to search ads: ${error.message}`);
        }
    }

    async getAdById(id: string): Promise<Ad> {
        try {
            const ad = await this.adsRepository.findOne({
                where: { id },
                relations: ['tags', 'adRoles', 'adRoles.role', 'user']
            });

            if (!ad) {
                throw new NotFoundException(`Ad with id: ${id} not found`);
            }

            return ad;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to get ad: ${error.message}`);
        }
    }
}