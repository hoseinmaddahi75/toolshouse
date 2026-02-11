import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import axios from "axios"

class ZarinpalPaymentProvider extends AbstractPaymentProvider {
  static identifier = "zarinpal"
  
  protected options_: any
  protected logger_: any

  constructor(container: any, options: any) {
    super(container)
    this.options_ = options
    this.logger_ = container.logger
    // 🔴 لاگ قرمز برای اطمینان از لود شدن کلاس
    console.error("🔴🔴🔴 [Zarinpal] CONSTRUCTOR CALLED 🔴🔴🔴")
  }

  async initiatePayment(input: any): Promise<any> {
    console.error("🔴🔴🔴 [Zarinpal] initiatePayment STARTED 🔴🔴🔴");
    console.error("📦 Input received:", JSON.stringify(input, null, 2));

    const { amount, currency_code } = input
    
    // تبدیل ریال به تومان
    const amountInToman = currency_code === "irr" ? Math.floor(amount / 10) : amount

    console.error(`💰 Amount: ${amount} ${currency_code} -> ${amountInToman} Toman`);

    try {
        console.error("🚀 Sending request to Sandbox...");
        const response = await axios.post("https://sandbox.zarinpal.com/pg/v4/payment/request.json", {
            merchant_id: this.options_.merchant_id,
            amount: amountInToman,
            currency: "IRT",
            description: "Order Payment",
            callback_url: "http://localhost:9000/zarinpal/verify", 
        });

        const { data } = response.data;
        console.error("📩 Zarinpal Response:", JSON.stringify(data));

        if (data && data.code === 100) {
            const sessionData = {
                data: {
                    authority: data.authority,
                    payment_url: `https://sandbox.zarinpal.com/pg/StartPay/${data.authority}`,
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
    console.error("🔄 [Zarinpal] authorizePayment called");
    const sessionData = paymentSessionData.data || paymentSessionData;

    if (!sessionData || !sessionData.authority) {
        return { status: "pending", data: sessionData };
    }

    try {
        const response = await axios.post("https://sandbox.zarinpal.com/pg/v4/payment/verify.json", {
            merchant_id: this.options_.merchant_id,
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