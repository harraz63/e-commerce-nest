import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CartService } from 'src/Cart/cart.service';
import { orderStatusEnum, paymentMethodEnum } from 'src/Common';
import { UserType } from 'src/DB/Models';
import { CartRepository, OrderRepository } from 'src/DB/Repositories';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
  ) {}

  // Create Order
  async createOrder({ order, user }) {
    const cart = await this.cartService.getCarts(user);
    if (!cart) throw new Error('Cart not found');

    const createdOrder = await this.orderRepository.createOrder({
      cart,
      userId: user._id as Types.ObjectId,
      ...order,
    });

    return { message: 'Orderr created successfully', createdOrder };
  }

  // Cancel Order
  async cancleOrder({
    orderId,
    user,
  }: {
    orderId: Types.ObjectId;
    user: Partial<UserType>;
  }) {
    // Find The Order
    const order = await this.orderRepository.findOne(
      { _id: orderId, userId: user._id },
      {},
      {
        populate: [
          {
            path: 'cartId',
            select: 'products',
            populate: {
              path: 'products.id',
              select: 'title finalPrice images',
            },
          },
        ],
      },
    );
    if (!order) throw new Error('Order not found');

    console.log(order);

    // Check For Order Status
    if (
      ![
        orderStatusEnum.PENDING,
        orderStatusEnum.PAID,
        orderStatusEnum.PLACED,
      ].includes(order.orderStatus as orderStatusEnum)
    ) {
      throw new NotFoundException('You can not cancel this order');
    }

    // Calculate The Different Between Creation Day And Cancelation Day
    const timeDiff = new Date().getTime() - (order as any).createdAt.getTime();
    const diffDays = timeDiff / (1000 * 3600 * 24);
    if (diffDays > 1) {
      throw new BadRequestException(
        'You can not cancel this order after 24 hours',
      );
    }

    // Update Order Status To Cancelation Status
    await this.orderRepository.updateOneDocument(
      { _id: orderId, userId: user._id },
      { status: orderStatusEnum.CANCELLED },
    );

    // If User Paid By Card, Update The Order And Set refundAt and refundBy
    if (order.paymentMethod === (paymentMethodEnum.CARD as string)) {
      await this.orderRepository.updateOneDocument(
        { _id: orderId, userId: user._id },
        {
          ['orderChanges.refundAt']: new Date(),
          ['orderChanges.refundBy']: user._id,
        },
      );
    }

    return { message: 'Order canceled successfully' };
  }
}
