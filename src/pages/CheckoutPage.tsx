import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '../lib/supabase'
import { Lock, CreditCard, CheckCircle } from 'lucide-react'

interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  })

  useEffect(() => {
    checkAuth()
    loadCart()
  }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUser(data.user)
      setFormData(prev => ({
        ...prev,
        email: data.user?.email || ''
      }))
    }
  }

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    } else {
      navigate('/cart')
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.15
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(total * 100),
          currency: 'sar',
          customer_email: formData.email,
          customer_name: formData.name,
          items: cartItems
        }
      })

      if (paymentError) throw paymentError

      const { clientSecret } = paymentData

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        }
      })

      if (confirmError) {
        throw confirmError
      }

      if (paymentIntent?.status === 'succeeded') {
        // Deliver digital codes
        await supabase.functions.invoke('deliver-digital-codes', {
          body: {
            order_id: paymentData.order_id,
            payment_intent_id: paymentIntent.id
          }
        })

        setSuccess(true)
        localStorage.removeItem('cart')
        
        setTimeout(() => {
          navigate('/orders')
        }, 3000)
      }

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الدفع')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h1 className="text-3xl font-bold mb-4 text-[#1A1A1A]">تم الدفع بنجاح</h1>
          <p className="text-gray-600 mb-8">سيتم إرسال الأكواد الرقمية إلى بريدك الإلكتروني</p>
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#1A1A1A]">إتمام الطلب</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#1A1A1A]">معلومات الدفع</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معلومات البطاقة
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#1A1A1A',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {loading ? 'جاري المعالجة...' : `الدفع ${total.toFixed(2)} ر.س`}
              </button>

              <p className="text-xs text-gray-500 text-center">
                الدفع آمن ومشفر. سيتم تسليم الأكواد فوراً بعد إتمام الدفع
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">ملخص الطلب</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{item.name}</p>
                    <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} ر.س</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الضريبة (15%)</span>
                <span>{tax.toFixed(2)} ر.س</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold text-[#1A1A1A]">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
