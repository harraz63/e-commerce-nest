import { Body, Controller, Post } from '@nestjs/common';
import { Auth, AuthUser, RolesEnum } from 'src/Common';
import { Types } from 'mongoose';
import { OrderService } from './order.service';
import { UserType } from 'src/DB/Models';
import { CreateOrderBodyDto } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Create Order
  @Post('create')
  @Auth([RolesEnum.USER])
  async createOrder(
    @AuthUser() user: Partial<UserType>,
    @Body() order: CreateOrderBodyDto,
  ) {
    return await this.orderService.createOrder({ order, user });
  }

  // Cancel Order
  @Post('cancel')
  @Auth([RolesEnum.USER])
  async cancelOrder(
    @AuthUser() user: Partial<UserType>,
    @Body('orderId') orderId: Types.ObjectId,
  ) {
    return await this.orderService.cancleOrder({ orderId, user });
  }
}
