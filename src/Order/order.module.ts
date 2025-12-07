import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  CartRepository,
  OrderRepository,
  ProductRepository,
} from 'src/DB/Repositories';
import { CartModel, OrderModel, ProductModel } from 'src/DB/Models';
import { CartService } from 'src/Cart/cart.service';
import { S3ClientService } from 'src/Common';
import { PaymentModule } from 'src/Paymant/payment.module';

@Module({
  imports: [OrderModel, CartModel, ProductModel, PaymentModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    CartService,
    CartRepository,
    ProductRepository,
    S3ClientService,
  ],
})
export class OrderModule {}
