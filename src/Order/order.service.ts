import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CartService } from 'src/Cart/cart.service';
import {
  orderStatusEnum,
  paymentMethodEnum,
  S3ClientService,
} from 'src/Common';
import { UserType } from 'src/DB/Models';
import { OrderRepository } from 'src/DB/Repositories';
import { StripeService } from 'src/Paymant/Services/stripe.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly stripeService: StripeService,
    private readonly s3Client: S3ClientService,
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

  // Pay Order
  async payOrder({ orderId, user }) {
    // Get The Order
    const order = await this.orderRepository.findOne(
      {
        _id: orderId as Types.ObjectId,
        userId: user._id as Types.ObjectId,
        orderStatus: orderStatusEnum.PENDING,
      },
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
    if (!order) throw new NotFoundException('Order not found');

    const line_items = order.cartId['products'].map((product) => ({
      price_data: {
        currency: 'EGP',
        product_data: {
          name: product.id.title,
          images: [this.s3Client.getFileWithSignedUrl(product.id.images[0])],
        },
        unit_amount: product.id.finalPrice * 100,
      },
      quantity: product.quantity,
    }));

    // Create Test Coupon
    const testCoupon = await this.stripeService.createCoupon({
      name: 'BLACK',
      percent_off: 30,
    });

    return this.stripeService.createCheckoutSession({
      line_items,
      customer_email: user.email,
      metadata: { orderId: order._id.toString() },
      discounts: [{ coupon: testCoupon.id }],
    });
  }

  // Webhook
  async webhook(body) {
    // Get The Order ID And Payment Intent
    const orderId = body.data.object.metadata.orderId;
    const paymentIntent = body.data.object.payment_intent;

    await this.orderRepository.updateOneDocument(
      { _id: orderId },
      {
        orderStatus: orderStatusEnum.PAID,
        arriveAt: new Date(),
        paymentIntentId: paymentIntent,
      },
    );
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
      const refund = await this.stripeService.refundPayment(
        order.paymentIntentId,
        'requested_by_customer',
      );
      console.log(refund);
      await this.orderRepository.updateOneDocument(
        { _id: orderId, userId: user._id },
        {
          orderStatus: orderStatusEnum.REFUNDED,
          orderChanges: {
            cancelledAt: Date.now(),
            cancelledBy: user._id,
            refundedAt: Date.now(),
            refundedBy: user._id,
          },
        },
      );
    }

    return { message: 'Order canceled successfully' };
  }
}
