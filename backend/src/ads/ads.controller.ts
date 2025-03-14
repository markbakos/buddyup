import {Body, Controller, Get, Post, UseGuards, Query, Param} from "@nestjs/common";
import {AdsService} from "./ads.service";
import {CreateAdDto} from "./dto/create-ad.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";

@Controller('ads')
export class AdsController {
    constructor(private adsService: AdsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createAd(
        @Body() createAdDto: CreateAdDto,
        @GetUser('userId') userId: string
    ) {
        createAdDto.userId = userId;
        return this.adsService.createAd(createAdDto);
    }

    @Get()
    async searchAds(
        @Query('keywords') keywords?: string,
        @Query('tags') tags?: string,
        @Query('location') location?: string,
        @Query('userId') userId?: string,
    ) {
        const tagsArray = tags ? tags.split(',').map((t) => t.trim()) : undefined;
        return this.adsService.searchAds(keywords, tagsArray, location, userId);
    }

    @Get(':id')
    async getAdById(@Param('id') id:string) {
        return this.adsService.getAdById(id);
    }
}