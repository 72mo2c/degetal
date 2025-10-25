import { Link } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Header() {
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // الحصول على المستخدم الحالي
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    // تحديث عدد عناصر السلة
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItemsCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
    }
    updateCartCount()
    
    // الاستماع لتغييرات السلة
    window.addEventListener('cartUpdated', updateCartCount)
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* الشعار */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-[#2563EB]">متجر الاشتراكات</div>
          </Link>

          {/* التنقل - سطح المكتب */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-[#404040] hover:text-[#2563EB] font-medium transition-colors">
              الرئيسية
            </Link>
            <Link to="/products" className="text-[#404040] hover:text-[#2563EB] font-medium transition-colors">
              المنتجات
            </Link>
            <Link to="/orders" className="text-[#404040] hover:text-[#2563EB] font-medium transition-colors">
              طلباتي
            </Link>
          </nav>

          {/* الأيقونات */}
          <div className="flex items-center gap-4">
            {/* البحث */}
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
              <Search className="w-5 h-5 text-[#525252]" />
            </button>

            {/* السلة */}
            <Link to="/cart" className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-[#525252]" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* الحساب */}
            <Link to={user ? "/account" : "/account"} className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
              <User className="w-5 h-5 text-[#525252]" />
            </Link>

            {/* القائمة - المحمول */}
            <button 
              className="md:hidden p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5 text-[#525252]" />
            </button>
          </div>
        </div>

        {/* القائمة المحمولة */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E5E5]">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-[#404040] hover:text-[#2563EB] font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                الرئيسية
              </Link>
              <Link to="/products" className="text-[#404040] hover:text-[#2563EB] font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                المنتجات
              </Link>
              <Link to="/orders" className="text-[#404040] hover:text-[#2563EB] font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                طلباتي
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}