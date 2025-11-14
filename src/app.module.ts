import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule, BrandModule } from './Modules/feature.modules';
import { GlobalModule } from './Modules/global.module';


@Module({
  imports: [
    AuthModule,
    BrandModule,
    GlobalModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
