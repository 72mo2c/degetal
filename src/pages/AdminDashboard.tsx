import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Upload,
  X
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  is_active: boolean
}

interface Stats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'اشتراكات',
    image_url: '',
    stock_quantity: 0
  })

  useEffect(() => {
    checkAdmin()
    loadData()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      navigate('/')
    }
  }

  const loadData = async () => {
    try {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      setProducts(productsData || [])

      // Load stats
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed')

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        totalUsers: usersCount || 0
      })

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        await supabase
          .from('products')
          .update(productForm)
          .eq('id', editingProduct.id)
      } else {
        await supabase
          .from('products')
          .insert([productForm])
      }

      setShowProductModal(false)
      setEditingProduct(null)
      setProductForm({
        name: '',
        description: '',
        price: 0,
        category: 'اشتراكات',
        image_url: '',
        stock_quantity: 0
      })
      loadData()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', id)

      loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity
    })
    setShowProductModal(true)
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#1A1A1A]">لوحة التحكم الإدارية</h1>

        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المنتجات</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الطلبات</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الإيرادات</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">
                      {stats.totalRevenue.toFixed(0)} ر.س
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المستخدمين</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('products')}
              className="px-6 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              إدارة المنتجات
            </button>
          </>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">إدارة المنتجات</h2>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة منتج جديد
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المنتج</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الفئة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">السعر</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المخزون</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-[#1A1A1A]">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.description?.slice(0, 50)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 font-semibold">{product.price} ر.س</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock_quantity > 10 
                            ? 'bg-green-100 text-green-700'
                            : product.stock_quantity > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">
                  {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر (ر.س)
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                    >
                      <option value="اشتراكات">اشتراكات</option>
                      <option value="ألعاب">ألعاب</option>
                      <option value="برامج">برامج</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    required
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كمية المخزون
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
                  >
                    {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
