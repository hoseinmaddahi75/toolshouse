import axios from "axios";

const API_KEY = process.env.FARAZ_API_KEY;
const SENDER = process.env.FARAZ_SENDER || "3000505";

export async function sendFarazPattern(
  mobile: string,
  patternCode: string,
  variables: Record<string, string>
) {
  if (!API_KEY) {
    console.error("❌ FARAZ_API_KEY is missing!");
    return;
  }

  const url = "https://api2.ippanel.com/api/v1/sms/pattern/normal/send";

  try {
    const response = await axios.post(
      url,
      {
        code: patternCode,
        sender: SENDER,
        recipient: mobile,
        variable: variables,
      },
      {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ SMS Sent to ${mobile} | Pattern: ${patternCode}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Faraz SMS Error:",
      error.response?.data || error.message
    );
  }
}