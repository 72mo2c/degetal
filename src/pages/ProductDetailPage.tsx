import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { ShoppingCart } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (id) loadProduct(id)
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        navigate('/products')
        return
      }
      setProduct(data)
    } catch (error) {
      console.error('خطأ في تحميل المنتج:', error)
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = () => {
    if (!product) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ product, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    navigate('/cart')
  }

  if (loading || !product) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="animate-pulse">
            <div className="bg-[#F5F5F5] h-96 rounded-2xl mb-8"></div>
            <div className="bg-[#F5F5F5] h-8 rounded w-1/3 mb-4"></div>
            <div className="bg-[#F5F5F5] h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-[#F5F5F5] rounded-2xl p-12 flex items-center justify-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name_ar} className="max-w-full max-h-96" />
              ) : (
                <div className="text-9xl">🎮</div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-[#171717] mb-4">{product.name_ar}</h1>
            <p className="text-xl text-[#525252] mb-6 leading-relaxed">{product.description_ar}</p>
            
            <div className="bg-[#F5F5F5] rounded-xl p-6 mb-6">
              <div className="text-sm text-[#525252] mb-2">السعر</div>
              <div className="text-4xl font-bold text-[#2563EB]">${product.price.toFixed(2)}</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#404040] mb-2">
                الكمية
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-[#F5F5F5] rounded-lg hover:bg-[#E5E5E5] transition-colors font-semibold"
                >
                  -
                </button>
                <div className="w-20 h-12 bg-[#F5F5F5] rounded-lg flex items-center justify-center font-semibold">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-[#F5F5F5] rounded-lg hover:bg-[#E5E5E5] transition-colors font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={addToCart}
              className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              أضف إلى السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
