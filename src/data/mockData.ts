// البيانات التجريبية للموقع - سيتم استبدالها بالبيانات الحقيقية من الباك إند

export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  price: number;
  image_url: string;
  stock_count: number;
  is_active: boolean;
}

export interface ProductCode {
  id: string;
  product_id: string;
  code: string;
  is_used: boolean;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_name_ar: string;
  price: number;
  quantity: number;
  image_url: string;
}

// المنتجات التجريبية
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    name_ar: 'نتفليكس بريميوم',
    description: 'Monthly subscription - 4K, Multi-device',
    description_ar: 'اشتراك شهري - 4K، متعدد الأجهزة',
    category: 'streaming',
    price: 19.99,
    image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500',
    stock_count: 50,
    is_active: true
  },
  {
    id: '2',
    name: 'Spotify Premium Family',
    name_ar: 'سبوتيفاي بريميوم عائلي',
    description: 'Premium Family subscription',
    description_ar: 'اشتراك بريميوم عائلي',
    category: 'streaming',
    price: 15.99,
    image_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=500',
    stock_count: 30,
    is_active: true
  },
  {
    id: '3',
    name: 'PlayStation Store $50',
    name_ar: 'بطاقة PlayStation 50 دولار',
    description: 'PlayStation Store Gift Card $50',
    description_ar: 'بطاقة هدايا PlayStation Store بقيمة 50 دولار',
    category: 'gaming',
    price: 50.00,
    image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500',
    stock_count: 100,
    is_active: true
  },
  {
    id: '4',
    name: 'Steam Wallet $20',
    name_ar: 'محفظة Steam 20 دولار',
    description: 'Steam Wallet Code $20',
    description_ar: 'كود محفظة Steam بقيمة 20 دولار',
    category: 'gaming',
    price: 20.00,
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
    stock_count: 80,
    is_active: true
  },
  {
    id: '5',
    name: 'Xbox Game Pass Ultimate',
    name_ar: 'Xbox Game Pass Ultimate',
    description: '3 Months subscription',
    description_ar: 'اشتراك 3 أشهر',
    category: 'gaming',
    price: 44.99,
    image_url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500',
    stock_count: 40,
    is_active: true
  },
  {
    id: '6',
    name: 'Apple Gift Card $25',
    name_ar: 'بطاقة Apple 25 دولار',
    description: 'App Store & iTunes Gift Card',
    description_ar: 'بطاقة هدايا App Store و iTunes',
    category: 'software',
    price: 25.00,
    image_url: 'https://images.unsplash.com/photo-1556589666-10a7bdcbe09e?w=500',
    stock_count: 60,
    is_active: true
  },
  {
    id: '7',
    name: 'Nintendo eShop $35',
    name_ar: 'Nintendo eShop 35 دولار',
    description: 'Nintendo eShop Card',
    description_ar: 'بطاقة Nintendo eShop',
    category: 'gaming',
    price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    stock_count: 45,
    is_active: true
  },
  {
    id: '8',
    name: 'Amazon Prime Video',
    name_ar: 'Amazon Prime Video',
    description: 'Annual subscription',
    description_ar: 'اشتراك سنوي',
    category: 'streaming',
    price: 119.00,
    image_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500',
    stock_count: 25,
    is_active: true
  }
];

// أكواد تجريبية
export const mockProductCodes: ProductCode[] = mockProducts.flatMap(product => 
  Array.from({ length: 10 }, (_, index) => ({
    id: `${product.id}-code-${index}`,
    product_id: product.id,
    code: `CODE-${product.id.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
    is_used: false
  }))
);

// إدارة السلة
class CartManager {
  private items: CartItem[] = [];

  getItems(): CartItem[] {
    return [...this.items];
  }

  addItem(product: Product, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.product_id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        product_id: product.id,
        product_name: product.name,
        product_name_ar: product.name_ar,
        price: product.price,
        quantity,
        image_url: product.image_url
      });
    }
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.product_id !== productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.items.find(item => item.product_id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  clear(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cartManager = new CartManager();

// نقاط الاتصال بالباك إند (سيتم تحديثها لاحقاً)
export const backendEndpoints = {
  // المنتجات
  getProducts: async (): Promise<Product[]> => {
    // مؤقتاً: إرجاع البيانات المحلية
    // لاحقاً: fetch(`${backendConfig.supabaseUrl}/rest/v1/products`)
    return mockProducts;
  },

  getProductById: async (id: string): Promise<Product | null> => {
    // مؤقتاً: البحث في البيانات المحلية
    const product = mockProducts.find(p => p.id === id);
    // لاحقاً: fetch من الباك إند
    return product || null;
  },

  // الطلبات (سيتم إضافتها لاحقاً)
  createPaymentIntent: async (cartItems: CartItem[], customerEmail: string) => {
    // سيتم استبدالها بـ Edge Function في المستقبل
    console.log('مؤقت: إنشاء Payment Intent', { cartItems, customerEmail });
    throw new Error('سيتم تفعيل نظام الدفع عند الاتصال بالباك إند');
  },

  deliverDigitalCodes: async (paymentIntentId: string) => {
    // سيتم استبدالها بـ Edge Function في المستقبل
    console.log('مؤقت: تسليم الأكواد الرقمية', { paymentIntentId });
    throw new Error('سيتم تفعيل التسليم التلقائي عند الاتصال بالباك إند');
  }
};