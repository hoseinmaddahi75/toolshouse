"use client"; // 👈 این خط جادویی باعث می‌شود onClick کار کند

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer"
    >
      <Printer size={18} />
      چاپ فاکتور
    </button>
  );
}