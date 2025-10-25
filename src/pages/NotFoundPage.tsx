import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-9xl font-bold text-[#1A1A1A] mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4 text-[#1A1A1A]">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-8 text-lg">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  )
}
