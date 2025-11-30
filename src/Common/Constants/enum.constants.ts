export enum RolesEnum {
  ADMIN = 'admin',
  USER = 'user',
  SUPER_ADMIN = 'super_admin',
}

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
}

export enum OtpEnum {
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

export const ProviderEnum = {
  LOCAL: 'local',
  GOOGLE: 'google',
};

export enum orderStatusEnum {
  PENDING = 'pending',
  PLACED = 'placed',
  PREPARING = 'preparing',
  ON_WAY = 'on_way',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum paymentMethodEnum {
  CASH = 'cash',
  CARD = 'card',
}
