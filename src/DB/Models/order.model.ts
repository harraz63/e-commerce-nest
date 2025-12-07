import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { paymentMethodEnum } from 'src/Common';
import { orderStatusEnum } from 'src/Common/Constants/enum.constants';

// Class
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Cart', required: true })
  cartId: string;

  @Prop({ type: Date, default: Date.now() + 3 * 24 * 60 * 60 * 1000 }) // 3 days from now
  arriveAt: Date;

  @Prop({ type: Number })
  total: number;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({
    type: String,
    enum: orderStatusEnum,
    default: orderStatusEnum.PENDING,
  })
  orderStatus: string;

  @Prop({ type: String, enum: paymentMethodEnum })
  paymentMethod: string;

  @Prop({ type: String })
  paymentIntentId: string;

  // This field can be used to track the order changes and can be separated on a model
  @Prop({
    type: {
      paidAt: Date,
      deliveredAt: Date,
      deliveredBy: { type: Types.ObjectId, ref: 'User' }, // delivery person
      cancelledAt: Date,
      cancelledBy: { type: Types.ObjectId, ref: 'User' }, // user should cancel his order
      refundedAt: Date,
      refundedBy: { type: Types.ObjectId, ref: 'User' }, // admins do manual refund , or in the cancellation api
    },
  })
  orderChanges: object;
}

// Schema
export const orderSchema = SchemaFactory.createForClass(Order);

// Model
export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);

// Type
export type OrderType = HydratedDocument<Order>;
