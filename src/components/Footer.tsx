import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-white mt-24">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* حول المتجر */}
          <div>
            <h3 className="text-xl font-bold mb-4">متجر الاشتراكات الرقمية</h3>
            <p className="text-[#A3A3A3] text-sm leading-relaxed">
              نوفر لك أفضل الاشتراكات الرقمية بأسعار تنافسية مع توصيل فوري وآمن.
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  طلباتي
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  حسابي
                </Link>
              </li>
            </ul>
          </div>

          {/* الدعم */}
          <div>
            <h4 className="font-semibold mb-4">الدعم</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  سياسة الاسترجاع
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  شروط الاستخدام
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors text-sm">
                  سياسة الخصوصية
                </a>
              </li>
            </ul>
          </div>

          {/* التواصل */}
          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-10 h-10 bg-[#404040] hover:bg-[#2563EB] rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#404040] hover:bg-[#2563EB] rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#404040] hover:bg-[#2563EB] rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#404040] hover:bg-[#2563EB] rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              البريد الإلكتروني:<br />
              <a href="mailto:support@example.com" className="hover:text-white transition-colors">
                support@example.com
              </a>
            </p>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t border-[#404040] mt-8 pt-8 text-center">
          <p className="text-[#A3A3A3] text-sm">
            © 2025 متجر الاشتراكات الرقمية. جميع الحقوق محفوظة.
          </p>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <img src="/images/visa.svg" alt="Visa" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/images/mastercard.svg" alt="Mastercard" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/images/stripe.svg" alt="Stripe" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  )
}