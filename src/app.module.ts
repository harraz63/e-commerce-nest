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
import { CartController } from './Cart/cart.controller';
import { CartModule } from './Cart/cart.module';
import { OrderModule } from './Order/order.module';
import { PaymentModule } from './Paymant/payment.module';

@Module({
  imports: [
    AuthModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    GlobalModule,
    PaymentModule,
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
