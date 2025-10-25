import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Package, Calendar, Download, CheckCircle, Clock } from 'lucide-react'

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_items?: Array<{
    id: string
    product_id: string
    quantity: number
    price_at_time: number
    products: {
      name: string
      image_url: string
    }
  }>
  items?: any[]
  codes?: any[]
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/login')
        return
      }

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price_at_time,
            products (name, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get codes for each order
      const ordersWithCodes = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: codesData } = await supabase
            .from('product_codes')
            .select('*')
            .eq('order_id', order.id)

          return {
            ...order,
            codes: codesData || []
          }
        })
      )

      setOrders(ordersWithCodes)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل'
      case 'pending':
        return 'قيد المعالجة'
      case 'failed':
        return 'فشل'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h1 className="text-3xl font-bold mb-4 text-[#1A1A1A]">لا توجد طلبات</h1>
          <p className="text-gray-600 mb-8">لم تقم بأي عمليات شراء بعد</p>
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
          >
            تصفح المنتجات
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#1A1A1A]">طلباتي</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-[#1A1A1A]">
                      طلب #{order.id.slice(0, 8)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">الإجمالي</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {order.total_amount.toFixed(2)} ر.س
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.products?.image_url || '/placeholder.png'}
                      alt={item.products?.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1A1A1A]">
                        {item.products?.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        الكمية: {item.quantity} × {item.price_at_time.toFixed(2)} ر.س
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Digital Codes */}
              {order.codes && order.codes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Download className="w-5 h-5 text-[#1A1A1A]" />
                    <h4 className="font-bold text-[#1A1A1A]">الأكواد الرقمية</h4>
                  </div>
                  <div className="space-y-2">
                    {order.codes.map((code: any) => (
                      <div
                        key={code.id}
                        className="bg-white p-3 rounded-lg flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <code className="font-mono text-sm font-semibold">
                            {code.code}
                          </code>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          code.is_used ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {code.is_used ? 'مستخدم' : 'جاهز'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.status === 'pending' && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                  <Clock className="w-4 h-4" />
                  جاري معالجة الطلب. سيتم تسليم الأكواد قريباً
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
