import { loadStripe } from '@stripe/stripe-js'

// مفتاح Stripe مع قيمة افتراضية للاختبار
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51QYiXP05Yd1F7OkJeN5bYXYpJXZUBr9KCfB0CdBqHF9Nz4QG1gLJYx7tYnU1YuMZLvGLjELK4LQH9nBKQF7qF8h00K8z7KQBt'

export const stripePromise = loadStripe(stripePublishableKey)

// معلومات الاتصال بالباك إند
export const stripeConfig = {
  publishableKey: stripePublishableKey,
  // سيتم إضافة المزيد من الإعدادات عند الاتصال بالباك إند
}