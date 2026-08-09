// src/app/actions/tapin.ts
"use server";

export async function getTapinTree() {
  try {
    console.log("🚀 [Tapin Debug] 1. Sending request to Tapin API...");
    
    const res = await fetch("https://api.tapin.ir/api/v2/public/state/tree/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({}),
      cache: "no-store", // 💡 کش موقتاً خاموش تا دیتای زنده رو ببینیم
    });
    
    console.log(`📡 [Tapin Debug] 2. Response Status Code: ${res.status}`);
    
    const data = await res.json();
    console.log("📦 [Tapin Debug] 3. Raw Data received (First 100 chars):", JSON.stringify(data).substring(0, 100));
    
    if (data?.entries) {
      const list = Array.isArray(data.entries) 
        ? data.entries 
        : (Array.isArray(data.entries.list) ? data.entries.list : []);
        
      console.log(`✅ [Tapin Debug] 4. Parsed Provinces Count: ${list.length}`);
      return list;
    }
    
    console.log("⚠️ [Tapin Debug] 5. No 'entries' found in response.");
    return [];
  } catch (error) {
    console.error("❌ [Tapin Debug] Server Fetch Error:", error);
    return [];
  }
}