import Razorpay from 'razorpay';
import { getUsdToInrRate } from './exchangeRate';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

type OrderForPayment = {
  id: string;
  amount: number;
  currency: 'INR' | 'USD';
  customerPhone: string;
};

// Always creates the Payment Link in INR — even for bulk/export
// (USD-priced) orders, we convert first, so no Razorpay international
// payments activation, IEC code, or extra KYC is needed right now.

export async function createPaymentLink(order: OrderForPayment) {
  let amountInInr = order.amount;

  if (order.currency === 'USD') {
    const rate = await getUsdToInrRate();
    amountInInr = Math.round(order.amount * rate);
  }

  return razorpay.paymentLink.create({
    amount: amountInInr * 100, // Razorpay expects paise
    currency: 'INR',
    notes: { order_id: order.id },
    customer: { contact: order.customerPhone },
  });
}
