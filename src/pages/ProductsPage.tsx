import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Product } from '../types'
import { mockProducts } from '../data/mockData'
import { ShoppingCart } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  useEffect(() => {
    loadProducts()
  }, [category])

  const loadProducts = async () => {
    try {
      let filteredProducts = mockProducts

      if (category) {
        filteredProducts = mockProducts.filter(product => product.category === category)
      }

      setProducts(filteredProducts)
    } catch (error) {
      console.error('خطأ في تحميل المنتجات:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ product, quantity: 1 })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#171717] mb-2">جميع المنتجات</h1>
          <p className="text-[#525252]">تصفح مجموعتنا الكاملة من الاشتراكات الرقمية</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="bg-[#F5F5F5] h-48 rounded-xl mb-4"></div>
                <div className="bg-[#F5F5F5] h-6 rounded mb-2"></div>
                <div className="bg-[#F5F5F5] h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="bg-[#F5F5F5] h-48 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl">🎮</div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-[#171717] mb-2">
                    {product.name_ar}
                  </h3>
                  <p className="text-sm text-[#525252] mb-4 line-clamp-2">
                    {product.description_ar}
                  </p>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#2563EB]">
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    أضف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
