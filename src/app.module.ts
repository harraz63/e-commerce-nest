import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule, BrandModule, ProductModule } from './Modules/feature.modules';
import { GlobalModule } from './Modules/global.module';
import { CategoryModule } from './Category/category.module';

@Module({
  imports: [
    AuthModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    GlobalModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
