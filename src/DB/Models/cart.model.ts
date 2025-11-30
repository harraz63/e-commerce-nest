import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Class
@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: { name: 'userId_idx_unique', unique: true },
  })
  userId: Types.ObjectId;

  @Prop([
    {
      id: { type: Types.ObjectId, ref: 'Product', required: true },
      finalPrice: Number,
      quantity: { type: Number, default: 1, min: 1 },
    },
  ])
  products: { id: Types.ObjectId; finalPrice: number; quantity: number }[];

  @Prop({ type: Number })
  subtotal: number;

  // shippingFee and VAT
  @Prop({ type: Number, default: 50 })
  shippingFee: number;

  @Prop({ type: Number, default: 30 })
  VAT: number;
}

// Schema
export const cartSchema = SchemaFactory.createForClass(Cart);

// Model
export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: cartSchema },
]);

// Type
export type CartType = HydratedDocument<Cart>;
