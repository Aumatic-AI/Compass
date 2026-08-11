// Free, no-API-key exchange rate lookup (Frankfurter, ECB-sourced).
// Used to convert bulk/export USD prices into a normal INR Razorpay
// link, without needing Razorpay's international payments activation.

export async function getUsdToInrRate(): Promise<number> {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR');
  const data = await res.json();
  return data.rates.INR;
}
