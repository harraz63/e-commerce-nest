import { Schema, SchemaFactory, MongooseModule, Prop } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { S3ClientService } from 'src/Common/Services';

const s3Client = new S3ClientService();

// Class
@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: String,
    index: {
      name: 'idx_title',
    },
    trim: true,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    index: {
      name: 'idx_slug',
    },
    trim: true,
    lowercase: true,
  })
  slug: string;

  @Prop({
    type: String,
  })
  overview: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: Number })
  finalPrice: number;

  @Prop({ type: Number, min: 0 })
  stock: number;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

// Schema
export const productSchema = SchemaFactory.createForClass(Product);

// Model
export const ProductModel = MongooseModule.forFeatureAsync([
  {
    name: Product.name,
    useFactory: () => {
      const schema = productSchema;
      // Hook For Pre Save
      schema.pre('save', function () {
        this.slug = slugify(this.title, {
          replacement: '_',
          lower: true,
          trim: true,
        });
        this.finalPrice = this.price - (this.price * this.discount) / 100;
      });
      return schema;
    },
  },
]);

// Type
export type ProductType = HydratedDocument<Product> & {
  firstImageUrl?: string | null; // optional property
};
