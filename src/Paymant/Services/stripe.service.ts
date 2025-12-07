import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET_KEY as string);

  // Create Checkout Session
  async createCheckoutSession({
    line_items = [],
    customer_email = '',
    metadata = {},
    discounts = [],
  }: Stripe.Checkout.SessionCreateParams) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      line_items,
      customer_email,
      metadata,
      discounts,
    });
  }

  // Create Coupon
  async createCoupon({
    name,
    amount_off,
    currency,
    percent_off,
  }: Stripe.CouponCreateParams) {
    return this.stripe.coupons.create({
      name,
      amount_off,
      currency,
      percent_off,
    });
  }

  // Refubd Payment
  async refundPayment(
    paymentIntentId: string,
    reason: Stripe.RefundCreateParams['reason'],
  ) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    });
  }
}
