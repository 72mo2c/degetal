import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, LogOut, Shield } from 'lucide-react'

export default function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || ''
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage('تم تحديث البيانات بنجاح')
      loadUserData()
    } catch (error: any) {
      setMessage('حدث خطأ أثناء التحديث: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#1A1A1A]">حسابي</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#1A1A1A] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-bold text-lg text-[#1A1A1A]">
                  {profile?.full_name || 'مستخدم جديد'}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <button className="w-full text-right px-4 py-3 bg-gray-100 rounded-lg font-medium text-[#1A1A1A]">
                  الملف الشخصي
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full text-right px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  طلباتي
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">معلومات الحساب</h2>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">لا يمكن تعديل البريد الإلكتروني</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                    placeholder="05xxxxxxxx"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg text-sm ${
                    message.includes('نجاح') 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors font-semibold disabled:opacity-50"
                >
                  {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#1A1A1A]" />
                  <h3 className="font-bold text-lg text-[#1A1A1A]">الأمان</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  حسابك محمي بنظام مصادقة آمن. جميع معاملاتك مشفرة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
