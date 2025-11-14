import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class Brand {
  @Prop({
    type: String,
    index: {
      name: 'idx_name_unique',
      unique: true,
    },
    trim: true,
    required: true,
  })
  name: string;

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
  logo: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  createdBy: Types.ObjectId;
}

const brandSchema = SchemaFactory.createForClass(Brand);

export const BrandModel = MongooseModule.forFeatureAsync([
  {
    name: 'Brand', 
    useFactory: () => {
      const schema = brandSchema;
      schema.pre('save', function () {
        this.slug = slugify(this.name, {
          replacement: '_',
          lower: true,
          trim: true,
        });
      });
      return schema;
    },
  },
]);

export type BrandType = HydratedDocument<Brand>;
