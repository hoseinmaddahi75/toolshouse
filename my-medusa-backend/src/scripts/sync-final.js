const axios = require('axios');
const https = require('https');

// ==========================================
// ⚙️ تنظیمات (اینجا رو چک کن)
// ==========================================

const CONFIG = {
    // تنظیمات وردپرس
    wp: {
        url: "https://toolshouse.ir",
        username: "cp58117",
        appPassword: "aMaa2pv1WXJbfte0iUZ1dSgr", // رمز عبور برنامه
        perPage: 20
    },
    // تنظیمات مدوسا
    medusa: {
        url: "http://localhost:9000",
        // توکن ادمین مدوسا رو از فایل .env بک‌اند بردار و اینجا بذار
        // یا از پنل ادمین یک API Token بساز
        adminToken: "sk_be1dc4b87ad1dbf63a632fcfe1ca7feb1f2e5becf477145afc5ed8362a864ee6" 
    }
};

// ==========================================
// 🚀 موتور اسکریپت
// ==========================================

// ایجنت برای نادیده گرفتن خطاهای احتمالی SSL در لوکال یا وردپرس
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// هدرهای احراز هویت وردپرس
const wpAuthHeader = Buffer.from(`${CONFIG.wp.username}:${CONFIG.wp.appPassword}`).toString('base64');
const wpHeaders = {
    'Authorization': `Basic ${wpAuthHeader}`,
    'Content-Type': 'application/json'
};

// هدرهای احراز هویت مدوسا
const medusaHeaders = {
    'Authorization': `Bearer ${CONFIG.medusa.adminToken}`,
    'Content-Type': 'application/json'
};

async function syncInventory() {
    console.log("🚀 Starting Sync Process (Simple Products Only)...");
    
    let page = 1;
    let hasMore = true;
    let totalUpdated = 0;
    let totalSkipped = 0;

    while (hasMore) {
        try {
            console.log(`\n📄 Fetching WordPress Page ${page}...`);

            // 1. دریافت محصولات از وردپرس
            const { data: wpProducts, headers } = await axios.get(`${CONFIG.wp.url}/wp-json/wc/v3/products`, {
                params: { 
                    page, 
                    per_page: CONFIG.wp.perPage,
                    status: 'publish', // فقط منتشر شده‌ها
                    type: 'simple'     // ⛔ فقط محصولات ساده (متغیرها رو نادیده بگیر)
                },
                headers: wpHeaders,
                httpsAgent
            });

            if (wpProducts.length === 0) {
                console.log("✅ End of WordPress list.");
                hasMore = false;
                break;
            }

            // 2. پردازش هر محصول
            for (const wpProduct of wpProducts) {
                const wpSlug = decodeURIComponent(wpProduct.slug); // هندل
                const wpStock = wpProduct.stock_quantity;
                const wpName = wpProduct.name;

                // اگر محصول مدیریت موجودی ندارد یا موجودی‌اش null است
                if (wpStock === null && wpProduct.manage_stock === false) {
                    console.log(`⏩ Skipped: ${wpName} (No stock management)`);
                    totalSkipped++;
                    continue;
                }

                // مقدار موجودی نهایی (اگر نال بود صفر در نظر بگیر)
                const finalStock = wpStock || 0;

                // 3. آپدیت در مدوسا
                await updateMedusaProduct(wpSlug, finalStock, wpName);
                totalUpdated++;
            }

            // بررسی صفحه بعد
            const totalPages = headers['x-wp-totalpages'];
            if (page >= totalPages) hasMore = false;
            page++;

        } catch (error) {
            console.error("❌ Critical Error in loop:", error.message);
            if (error.response) console.error("Response:", error.response.status);
            hasMore = false;
        }
    }

    console.log("\n==========================================");
    console.log(`🎉 Sync Completed!`);
    console.log(`✅ Updated: ${totalUpdated}`);
    console.log(`⏩ Skipped: ${totalSkipped}`);
    console.log("==========================================");
}

// تابع آپدیت تکی در مدوسا
async function updateMedusaProduct(handle, quantity, name) {
    try {
        // الف) جستجوی محصول در مدوسا با هندل
        const searchRes = await axios.get(`${CONFIG.medusa.url}/admin/products`, {
            params: { handle: handle },
            headers: medusaHeaders
        });

        const medusaProduct = searchRes.data.products[0];

        if (!medusaProduct) {
            console.warn(`⚠️ Not Found in Medusa: "${handle}" (WP: ${name})`);
            return;
        }

        // ب) پیدا کردن آیدی واریانت (محصولات ساده معمولا ۱ واریانت دارند)
        const variantId = medusaProduct.variants[0].id;
        const productId = medusaProduct.id;

        // ج) ارسال درخواست آپدیت به مدوسا
        // نکته: ما manage_inventory را هم true می‌کنیم تا مطمئن شویم موجودی اعمال می‌شود
        await axios.post(`${CONFIG.medusa.url}/admin/products/${productId}/variants/${variantId}`, {
            inventory_quantity: quantity,
            manage_inventory: true,
            allow_backorder: false 
        }, {
            headers: medusaHeaders
        });

        console.log(`✅ Synced: ${handle} -> Stock: ${quantity}`);

    } catch (error) {
        console.error(`❌ Failed to update ${handle}:`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Msg: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`   Msg: ${error.message}`);
        }
    }
}

// اجرا
syncInventory();