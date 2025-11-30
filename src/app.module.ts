import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthModule,
  BrandModule,
  ProductModule,
} from './Modules/feature.modules';
import { GlobalModule } from './Modules/global.module';
import { CategoryModule } from './Category/category.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    AuthModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    GlobalModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({ stores: [new KeyvRedis('redis://localhost:6379')] }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
