import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Ad} from "./ad.entity";
import {Tag} from "./tag.entity";
import {AdsService} from "./ads.service";
import {AdsController} from "./ads.controller";
import {AdRole} from "./ad-role.entity";
import {Role} from "./role.entity";
import {User} from "../users/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Ad, Tag, Role, AdRole, User])],
    providers: [AdsService],
    controllers: [AdsController],
})

export class AdsModule {}