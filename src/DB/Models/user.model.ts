import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  GenderEnum,
  OtpEnum,
  ProviderEnum,
  RolesEnum,
} from 'src/Common/Constants';

// OTP Class
@Schema({ _id: false })
class Otp {
  @Prop({ enum: Object.values(OtpEnum), required: true })
  type: OtpEnum;

  @Prop({ required: true })
  value: string;

  @Prop({
    default: () => new Date(Date.now() + 10 * 60 * 1000),
  }) // 10 Minutes Expiry
  expiresAt: Date;
}
const otpSchema = SchemaFactory.createForClass(Otp);

// User Class
@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Prop({ trim: true, lowercase: true })
  firstName: string;

  @Prop({ trim: true, lowercase: true })
  lastName: string;

  @Prop({ unique: [true, 'Email already exists'] })
  email: string;

  @Prop({ trim: true })
  password: string;

  @Prop({ default: RolesEnum.USER, enum: RolesEnum })
  role: string;

  @Prop({ min: 18, max: [100, 'Age must be between 18 and 100'] })
  age: number;

  @Prop({ enum: GenderEnum })
  gender: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ trim: true })
  phone: string;

  @Prop({ type: otpSchema, required: false })
  otp?: Otp;

  @Prop({ unique: true, sparse: true })
  googleSub: string;

  @Prop({ enum: ProviderEnum, default: ProviderEnum.LOCAL })
  provider: string;

  @Virtual({
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;
}

// Schama
export const UserSchema = SchemaFactory.createForClass(User);

// Model
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);

// Type
export type UserType = HydratedDocument<User>;
