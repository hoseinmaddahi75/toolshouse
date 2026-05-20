import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import axios from "axios"

class ZarinpalPaymentProvider extends AbstractPaymentProvider {
  static identifier = "zarinpal"
  
  protected options_: any
  protected logger_: any
  
  // 💎 مرچنت کد واقعی شما اینجا ذخیره میشه تا همیشه در دسترس باشه
  protected merchantId_ = process.env.ZARINPAL_MERCHANT_ID || "4d661eb3-9c4f-4a6c-8ab5-caaa4d6112e8";

  constructor(container: any, options: any) {
    super(container)
    this.options_ = options
    this.logger_ = container.logger
    console.error("🟢🟢🟢 [Zarinpal] PRODUCTION CONSTRUCTOR CALLED 🟢🟢🟢")
  }

  async initiatePayment(input: any): Promise<any> {
    console.error("🟢🟢🟢 [Zarinpal] initiatePayment STARTED (PRODUCTION) 🟢🟢🟢");

    const { amount, currency_code } = input
    
    // تبدیل ریال به تومان
    const amountInToman = currency_code === "irr" ? Math.floor(amount / 10) : amount

    console.error(`💰 Amount: ${amount} ${currency_code} -> ${amountInToman} Toman`);

    try {
        console.error("🚀 Sending request to REAL Zarinpal API...");
        // تغییر آدرس از sandbox به api (سرور واقعی زرین‌پال)
        const response = await axios.post("https://api.zarinpal.com/pg/v4/payment/request.json", {
            merchant_id: this.merchantId_,
            amount: amountInToman,
            currency: "IRT",
            description: "پرداخت سفارش - تولزهوس",
            callback_url: "https://api.toolshouse.ir/zarinpal/verify", 
        });

        const { data } = response.data;
        
        if (data && data.code === 100) {
            const sessionData = {
                data: {
                    authority: data.authority,
                    // تغییر آدرس هدایت کاربر به درگاه اصلی زرین‌پال
                    payment_url: `https://www.zarinpal.com/pg/StartPay/${data.authority}`,
                    amount: amountInToman
                }
            };
            console.error("✅ Session Data Prepared:", JSON.stringify(sessionData));
            return sessionData;
        } else {
            throw new Error(`Zarinpal Init Error: ${JSON.stringify(response.data)}`);
        }

    } catch (error: any) {
        console.error("❌❌❌ Zarinpal Initiate Error:", error.response?.data || error.message);
        throw error;
    }
  }

  async authorizePayment(paymentSessionData: any): Promise<any> {
    console.error("🔄 [Zarinpal] authorizePayment called (PRODUCTION)");
    const sessionData = paymentSessionData.data || paymentSessionData;

    if (!sessionData || !sessionData.authority) {
        return { status: "pending", data: sessionData };
    }

    try {
        // تغییر آدرس از sandbox به api برای وریفای کردن پول
        const response = await axios.post("https://api.zarinpal.com/pg/v4/payment/verify.json", {
            merchant_id: this.merchantId_,
            amount: sessionData.amount,
            authority: sessionData.authority
        });

        const { data } = response.data;

        if (data && (data.code === 100 || data.code === 101)) {
            return {
                status: "authorized",
                data: { ...sessionData, ref_id: data.ref_id }
            };
        } else {
            return { status: "pending", data: sessionData };
        }

    } catch (error: any) {
        console.error("❌ Zarinpal Verify Error:", error.message);
        return { status: "pending", data: sessionData };
    }
  }

  async updatePayment(context: any): Promise<any> { return { data: context.data || {} }; }
  async cancelPayment(i: any): Promise<any> { return i }
  async capturePayment(i: any): Promise<any> { return i }
  async deletePayment(i: any): Promise<any> { return i }
  async getPaymentStatus(i: any): Promise<any> { return { status: "authorized" } }
  async refundPayment(i: any): Promise<any> { return i }
  async retrievePayment(i: any): Promise<any> { return i }
  async getWebhookActionAndData(d: any): Promise<any> { return { action: "not_supported" } }
}

export default ZarinpalPaymentProvider