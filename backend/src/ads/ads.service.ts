import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Ad} from "./ad.entity";
import {Tag} from "./tag.entity";
import {CreateAdDto} from "./dto/create-ad.dto";
import {Role} from "./role.entity";
import {AdRole} from "./ad-role.entity";

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
    ) {}

    async createAd(createAdDto: CreateAdDto): Promise<Ad> {
        try {
            const { title, description, tags, roles, metadata } = createAdDto;

            const ad = this.adsRepository.create({ title, description, metadata });

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
        page: number = 1,
        limit: number = 10
    ): Promise<{ ads: Ad[], total: number, page: number, limit: number }> {
        try {
            const query = this.adsRepository.createQueryBuilder('ad')
                .leftJoinAndSelect('ad.tags', 'tag')
                .leftJoinAndSelect('ad.adRoles', 'adRole')
                .leftJoinAndSelect('adRole.role', 'role')
                .skip((page - 1) * limit)
                .take(limit);

            if (keywords) {
                query.andWhere(
                    '(ad.title ILIKE :keywords OR ad.description ILIKE :keywords)',
                    { keywords: `%${keywords}%`}
                );
            }

            if (tags && tags.length > 0) {
                query.andWhere('tag.name IN (:...tags)', { tags });
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
                relations: ['tags', 'adRoles', 'adRoles.role']
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