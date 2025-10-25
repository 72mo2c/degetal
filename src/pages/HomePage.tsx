import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../types'
import { mockProducts } from '../data/mockData'
import { ShoppingCart, Zap, Shield, HeadphonesIcon, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      // Use mock data instead of Supabase for frontend-only demo
      const featured = mockProducts.slice(0, 4)
      setFeaturedProducts(featured)
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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white">
        <div className="container mx-auto px-4 lg:px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              احصل على اشتراكاتك الرقمية بأفضل الأسعار
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              نتفليكس، سبوتيفاي، ألعاب وأكثر - توصيل فوري وآمن
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="bg-white text-[#2563EB] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              >
                ابدأ التسوق
              </Link>
              <a 
                href="#features" 
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
              >
                اعرف المزيد
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-6 h-6 text-[#2563EB]" />
              <span className="font-medium text-[#404040]">توصيل فوري</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-6 h-6 text-[#2563EB]" />
              <span className="font-medium text-[#404040]">دفع آمن</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <HeadphonesIcon className="w-6 h-6 text-[#2563EB]" />
              <span className="font-medium text-[#404040]">دعم 24/7</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#2563EB]" />
              <span className="font-medium text-[#404040]">ضمان استرداد</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#171717] mb-4">
              المنتجات الأكثر مبيعاً
            </h2>
            <p className="text-xl text-[#525252]">
              احصل على أفضل الاشتراكات الرقمية بأسعار تنافسية
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="bg-[#F5F5F5] h-48 rounded-xl mb-4"></div>
                  <div className="bg-[#F5F5F5] h-6 rounded mb-2"></div>
                  <div className="bg-[#F5F5F5] h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
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

          <div className="text-center mt-12">
            <Link 
              to="/products" 
              className="inline-block bg-[#2563EB] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#1D4ED8] transition-all transform hover:scale-105"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#171717] mb-4">
              الفئات الرئيسية
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'نتفليكس', icon: '🎬', category: 'streaming' },
              { name: 'سبوتيفاي', icon: '🎵', category: 'streaming' },
              { name: 'ألعاب', icon: '🎮', category: 'gaming' },
              { name: 'برامج', icon: '💻', category: 'software' },
              { name: 'بطاقات هدايا', icon: '🎁', category: 'gift' },
              { name: 'اشتراكات', icon: '📱', category: 'subscription' },
            ].map((cat, idx) => (
              <Link 
                key={idx}
                to={`/products?category=${cat.category}`}
                className="bg-[#FAFAFA] rounded-2xl p-8 text-center hover:bg-[#2563EB] hover:text-white transition-all group"
              >
                <div className="text-5xl mb-3">{cat.icon}</div>
                <div className="font-semibold">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#171717] mb-4">
              كيف يعمل الموقع
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'اختر المنتج', desc: 'تصفح مكتبتنا الواسعة من الاشتراكات الرقمية' },
              { step: '2', title: 'ادفع بأمان', desc: 'استخدم طرق الدفع الآمنة والموثوقة' },
              { step: '3', title: 'احصل على الكود', desc: 'استلم كودك الرقمي فوراً عبر البريد الإلكتروني' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold text-[#171717] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#525252] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#2563EB] text-white py-24">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ابدأ التسوق الآن واحصل على أفضل الأسعار
          </h2>
          <Link 
            to="/products" 
            className="inline-block bg-white text-[#2563EB] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
          >
            تصفح المنتجات
          </Link>
        </div>
      </section>
    </div>
  )
}
