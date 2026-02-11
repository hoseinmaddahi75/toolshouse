export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* سمت راست هدر (تایتل یا بردکرامب) */}
      <div className="text-sm text-gray-500">
        خوش آمدید، <span className="font-bold text-gray-800">مدیر فروشگاه</span>
      </div>

      {/* سمت چپ هدر (آواتار یا نوتیفیکیشن) */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
          م
        </div>
      </div>
    </header>
  );
}