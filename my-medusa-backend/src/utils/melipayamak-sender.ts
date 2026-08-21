import axios from "axios";

export async function sendMelliPayamakPattern(phone: string, bodyId: string, args: any[]) {
  try {
    // ۱. نرمال‌سازی شماره موبایل
    let normalizedPhone = String(phone).trim().replace(/\s+/g, '');
    if (normalizedPhone.startsWith('+98')) {
      normalizedPhone = '0' + normalizedPhone.substring(3);
    } else if (normalizedPhone.startsWith('98') && normalizedPhone.length === 12) {
      normalizedPhone = '0' + normalizedPhone.substring(2);
    } else if (normalizedPhone.startsWith('9') && normalizedPhone.length === 10) {
      normalizedPhone = '0' + normalizedPhone;
    }

    // ۲. اتصال متغیرها با سمیکالن (;)
    const textData = Array.isArray(args) ? args.join(';') : String(args);

    // ۳. ساخت Payload دقیقاً مطابق مستندات PDF
    const payload = {
      username: process.env.SMS_USERNAME,
      password: process.env.SMS_PASSWORD, // این مقدار حالا همان API Key است
      text: textData,
      to: normalizedPhone,
      bodyId: Number(bodyId)
    };

    // ۴. ارسال با متد REST و دور زدن پروکسی
    const response = await axios.post(
      "https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", 
      payload,
      { proxy: false } // برای جلوگیری از خطای ECONNRESET
    );
    
    console.log("✅ SMS Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ MelliPayamak Error:", error?.response?.data || error.message);
    throw error;
  }
}