import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "./users/users.module";
import {AuthModule} from "./auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import {AdsModule} from "./ads/ads.module";

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'buddyup',
        autoLoadEntities: true,
        synchronize: true, //disable in production
          logging: true,
      }),
      UsersModule,
      AuthModule,
      AdsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
