import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "./users/users.module";
import {AuthModule} from "./auth/auth.module";
import {ConfigModule} from "@nestjs/config";

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
      }),
      UsersModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
