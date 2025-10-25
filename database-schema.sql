-- ===================================
-- متجر الاشتراكات الرقمية - قاعدة البيانات
-- ===================================

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول أكواد المنتجات
CREATE TABLE IF NOT EXISTS product_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    used_by_user_id UUID,
    order_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    stripe_payment_intent_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    customer_email TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول عناصر الطلبات
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    digital_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول ملفات المستخدمين
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة للمنتجات
DROP POLICY IF EXISTS "المنتجات يمكن قراءتها من الجميع" ON products;
CREATE POLICY "المنتجات يمكن قراءتها من الجميع"
    ON products FOR SELECT
    USING (is_active = true);

-- سياسات الطلبات
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية طلباتهم" ON orders;
CREATE POLICY "المستخدمون يمكنهم رؤية طلباتهم"
    ON orders FOR SELECT
    USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

DROP POLICY IF EXISTS "إنشاء طلبات عبر Edge Functions" ON orders;
CREATE POLICY "إنشاء طلبات عبر Edge Functions"
    ON orders FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

DROP POLICY IF EXISTS "تحديث الطلبات عبر Edge Functions" ON orders;
CREATE POLICY "تحديث الطلبات عبر Edge Functions"
    ON orders FOR UPDATE
    USING (auth.role() IN ('anon', 'service_role'));

-- سياسات عناصر الطلبات
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية عناصر طلباتهم" ON order_items;
CREATE POLICY "المستخدمون يمكنهم رؤية عناصر طلباتهم"
    ON order_items FOR SELECT
    USING (auth.role() IN ('anon', 'service_role'));

DROP POLICY IF EXISTS "إنشاء عناصر الطلبات عبر Edge Functions" ON order_items;
CREATE POLICY "إنشاء عناصر الطلبات عبر Edge Functions"
    ON order_items FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- سياسات أكواد المنتجات
DROP POLICY IF EXISTS "الأكواد للإدارة فقط" ON product_codes;
CREATE POLICY "الأكواد للإدارة فقط"
    ON product_codes FOR ALL
    USING (auth.role() = 'service_role');

-- سياسات ملفات المستخدمين
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية ملفهم" ON profiles;
CREATE POLICY "المستخدمون يمكنهم رؤية ملفهم"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث ملفهم" ON profiles;
CREATE POLICY "المستخدمون يمكنهم تحديث ملفهم"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "إنشاء ملفات المستخدمين عبر Edge Functions" ON profiles;
CREATE POLICY "إنشاء ملفات المستخدمين عبر Edge Functions"
    ON profiles FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- ===================================
-- بيانات تجريبية
-- ===================================

-- حذف البيانات القديمة
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM product_codes;
DELETE FROM products;

-- إدراج المنتجات التجريبية
INSERT INTO products (name, name_ar, description, description_ar, category, price, image_url, stock_count) VALUES
('Netflix Premium', 'نتفليكس بريميوم', 'Monthly subscription - 4K, Multi-device', 'اشتراك شهري - 4K، متعدد الأجهزة', 'streaming', 19.99, '/images/netflix.jpg', 50),
('Spotify Premium Family', 'سبوتيفاي بريميوم عائلي', 'Premium Family subscription', 'اشتراك بريميوم عائلي', 'streaming', 15.99, '/images/spotify.jpg', 30),
('PlayStation Store $50', 'بطاقة PlayStation 50 دولار', 'PlayStation Store Gift Card $50', 'بطاقة هدايا PlayStation Store بقيمة 50 دولار', 'gaming', 50.00, '/images/playstation.jpg', 100),
('Steam Wallet $20', 'محفظة Steam 20 دولار', 'Steam Wallet Code $20', 'كود محفظة Steam بقيمة 20 دولار', 'gaming', 20.00, '/images/steam.jpg', 80),
('Xbox Game Pass Ultimate', 'Xbox Game Pass Ultimate', '3 Months subscription', 'اشتراك 3 أشهر', 'gaming', 44.99, '/images/xbox.jpg', 40),
('Apple Gift Card $25', 'بطاقة Apple 25 دولار', 'App Store & iTunes Gift Card', 'بطاقة هدايا App Store و iTunes', 'software', 25.00, '/images/apple.jpg', 60),
('Nintendo eShop $35', 'Nintendo eShop 35 دولار', 'Nintendo eShop Card', 'بطاقة Nintendo eShop', 'gaming', 35.00, '/images/nintendo.jpg', 45),
('Amazon Prime Video', 'Amazon Prime Video', 'Annual subscription', 'اشتراك سنوي', 'streaming', 119.00, '/images/amazon.jpg', 25);

-- إنشاء أكواد تجريبية لكل منتج
INSERT INTO product_codes (product_id, code)
SELECT p.id, 
       'CODE-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))
FROM products p
CROSS JOIN generate_series(1, 10) -- 10 أكواد لكل منتج
WHERE p.id IN (SELECT id FROM products);