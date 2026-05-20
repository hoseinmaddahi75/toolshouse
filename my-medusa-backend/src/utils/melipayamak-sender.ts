import axios from "axios";

export async function sendMelliPayamakPattern(phone: string, bodyId: string, args: Record<string, string>) {
  try {
    const text = args.code; 
    const response = await axios.post("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", {
      username: process.env.SMS_USERNAME,
      password: process.env.SMS_PASSWORD,
      text: text,
      to: phone,
      bodyId: Number(bodyId)
    });
    console.log("✅ SMS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ MelliPayamak Error:", error);
    throw error;
  }
}