import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Ad} from "./ad.entity";
import {Tag} from "./tag.entity";
import {CreateAdDto} from "./dto/create-ad.dto";

@Injectable()
export class AdsService {
    constructor(
       @InjectRepository(Ad)
       private adsRepository: Repository<Ad>,

       @InjectRepository(Tag)
       private tagsRepository: Repository<Tag>,
    ) {}

    async createAd(CreateAdDto: CreateAdDto): Promise<Ad> {
        const { title, description, tags, metadata } = CreateAdDto;

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

        return this.adsRepository.save(ad);
    }

    async searchAds(keywords?: string, tags?: string[]): Promise<Ad[]> {
        const query = this.adsRepository.createQueryBuilder('ad')
            .leftJoinAndSelect('ad.tags', 'tag');

        if (keywords) {
            query.andWhere(
                '(ad.title ILIKE :keywords OR ad.description ILIKE :keywords)',
                { keywords: `%${keywords}%`}
            );
        }

        if (tags && tags.length > 0) {
            query.andWhere('tag.name IN (:...tags)', { tags });
        }

        const ads = await query.getMany();
        if (!ads || ads.length === 0) {
            throw new NotFoundException('No ads found matching criteria');
        }
        return ads;
    }

    async getAdById(id: string): Promise<Ad> {
        const ad = await this.adsRepository.findOne({where: { id }});
        if (!ad) {
            throw new NotFoundException(`Ad with id: ${id} not found`);
        }
        return ad;
    }
}