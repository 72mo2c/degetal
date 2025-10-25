// Edge Function لإنشاء Payment Intent مع Stripe
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { amount, currency = 'usd', cartItems, customerEmail } = await req.json();

        if (!amount || amount <= 0) {
            throw new Error('المبلغ مطلوب ويجب أن يكون أكبر من صفر');
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('عناصر السلة مطلوبة');
        }

        // الحصول على مفاتيح البيئة
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey) {
            throw new Error('مفتاح Stripe غير مكون');
        }

        // حساب المبلغ الإجمالي من عناصر السلة للتحقق
        const calculatedAmount = cartItems.reduce((sum: number, item: any) => 
            sum + (item.price * item.quantity), 0
        );
        
        if (Math.abs(calculatedAmount - amount) > 0.01) {
            throw new Error('خطأ في حساب المبلغ الإجمالي');
        }

        // الحصول على معلومات المستخدم إن وجدت
        let userId = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader && serviceRoleKey && supabaseUrl) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                }
            } catch (error) {
                console.log('تعذر الحصول على بيانات المستخدم:', error.message);
            }
        }

        // إنشاء Payment Intent مع Stripe
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString());
        stripeParams.append('currency', currency);
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[customer_email]', customerEmail || '');
        stripeParams.append('metadata[user_id]', userId || '');

        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            throw new Error(`خطأ في Stripe API: ${errorData}`);
        }

        const paymentIntent = await stripeResponse.json();

        // إنشاء سجل الطلب في قاعدة البيانات
        if (serviceRoleKey && supabaseUrl) {
            const orderData = {
                user_id: userId,
                stripe_payment_intent_id: paymentIntent.id,
                status: 'pending',
                total_amount: amount,
                currency: currency,
                customer_email: customerEmail || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(orderData)
            });

            if (orderResponse.ok) {
                const order = await orderResponse.json();
                const orderId = order[0].id;

                // إنشاء عناصر الطلب
                const orderItems = cartItems.map((item: any) => ({
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_time: item.price,
                    product_name: item.product_name,
                    product_image_url: item.product_image_url || null,
                    created_at: new Date().toISOString()
                }));

                await fetch(`${supabaseUrl}/rest/v1/order_items`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderItems)
                });
            }
        }

        return new Response(JSON.stringify({
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: amount,
                currency: currency
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('خطأ في إنشاء Payment Intent:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'PAYMENT_INTENT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});