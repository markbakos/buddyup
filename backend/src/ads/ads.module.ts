import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Ad} from "./ad.entity";
import {Tag} from "./tag.entity";
import {AdsService} from "./ads.service";
import {AdsController} from "./ads.controller";
import {AdRole} from "./ad-role.entity";
import {Role} from "./role.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Ad, Tag, Role, AdRole])],
    providers: [AdsService],
    controllers: [AdsController],
})

export class AdsModule {}