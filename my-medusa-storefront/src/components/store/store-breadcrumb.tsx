import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function StoreBreadcrumb({ title }: { title: string }) {
  return (
    <div className="w-full bg-[#FAFAFA] border-b border-[#E7E7E8]">
      <div className="container mx-auto px-4 h-12 flex items-center text-xs text-gray-500">
        <Link href="/" className="hover:text-black transition-colors">
          خانه
        </Link>
        <span className="mx-2 text-[#E7E7E8]">/</span>
        <Link href="/store" className="hover:text-black transition-colors">
          فروشگاه
        </Link>
        <span className="mx-2 text-[#E7E7E8]">/</span>
        <span className="text-black font-medium">{title}</span>
      </div>
    </div>
  );
}