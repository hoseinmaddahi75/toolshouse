"use client";

import { useState } from "react";

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fulfillmentId, setFulfillmentId] = useState("");

  const runXray = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentId }),
      });
      const result = await res.json();
      setData(result);
    } catch (e: any) {
      setData({ FATAL_ERROR: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10" dir="ltr">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Fulfillment X-Ray Scanner 🩻</h1>
      <p className="mb-4 text-gray-600">Enter Fulfillment ID (e.g. ful_01KD...)</p>
      
      <div className="flex gap-2 mb-6">
        <input 
          value={fulfillmentId} 
          onChange={(e) => setFulfillmentId(e.target.value)}
          placeholder="ful_..."
          className="border p-2 w-96 rounded font-mono"
        />
        <button 
            onClick={runXray} 
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50"
        >
            {loading ? "SCANNING..." : "START SCAN"}
        </button>
      </div>

      {data && (
        <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="border rounded bg-slate-50 overflow-hidden">
                    <div className="bg-slate-200 p-2 font-bold text-sm border-b">{key}</div>
                    <pre className="p-4 text-xs overflow-auto max-h-60 text-blue-800">
                        {JSON.stringify(value, null, 2)}
                    </pre>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}