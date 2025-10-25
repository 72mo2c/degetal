// Edge Function للتسليم التلقائي للأكواد الرقمية بعد الدفع
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { paymentIntentId } = await req.json();

        if (!paymentIntentId) {
            throw new Error('معرف الدفع مطلوب');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('إعدادات Supabase غير مكتملة');
        }

        // الحصول على الطلب من قاعدة البيانات
        const orderResponse = await fetch(
            `${supabaseUrl}/rest/v1/orders?stripe_payment_intent_id=eq.${paymentIntentId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!orderResponse.ok) {
            throw new Error('فشل في الحصول على الطلب');
        }

        const orders = await orderResponse.json();
        if (!orders || orders.length === 0) {
            throw new Error('الطلب غير موجود');
        }

        const order = orders[0];

        // الحصول على عناصر الطلب
        const itemsResponse = await fetch(
            `${supabaseUrl}/rest/v1/order_items?order_id=eq.${order.id}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const orderItems = await itemsResponse.json();

        // لكل عنصر، نحصل على كود رقمي متاح
        const codesDelivered = [];
        for (const item of orderItems) {
            // الحصول على كود غير مستخدم للمنتج
            const codesResponse = await fetch(
                `${supabaseUrl}/rest/v1/product_codes?product_id=eq.${item.product_id}&is_used=eq.false&limit=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            const availableCodes = await codesResponse.json();
            if (availableCodes && availableCodes.length > 0) {
                const code = availableCodes[0];
                
                // تحديث الكود كمستخدم
                await fetch(
                    `${supabaseUrl}/rest/v1/product_codes?id=eq.${code.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            is_used: true,
                            used_at: new Date().toISOString(),
                            used_by_user_id: order.user_id,
                            order_id: order.id
                        })
                    }
                );

                // تحديث عنصر الطلب بالكود
                await fetch(
                    `${supabaseUrl}/rest/v1/order_items?id=eq.${item.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            digital_code: code.code
                        })
                    }
                );

                codesDelivered.push({
                    product_name: item.product_name,
                    code: code.code
                });
            }
        }

        // تحديث حالة الطلب
        await fetch(
            `${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
            }
        );

        return new Response(JSON.stringify({
            data: {
                success: true,
                codesDelivered: codesDelivered,
                message: 'تم تسليم الأكواد بنجاح'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('خطأ في تسليم الأكواد:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'DELIVERY_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});