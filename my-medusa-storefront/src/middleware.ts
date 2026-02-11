import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // دریافت توکن‌ها
  const customerToken = request.cookies.get("_medusa_jwt")?.value;
  const adminToken = request.cookies.get("_medusa_admin_token")?.value;

  const customerProtectedRoutes = ["/account", "/checkout", "/order/confirmed"];
  const adminProtectedRoutes = ["/dashboard"];
  
  // صفحاتی که کاربر لاگین شده نباید ببیند (چون الان لاگین است)
  const authRoutes = ["/account/login", "/account/register"];

  // 1. منطق ادمین
  if (adminProtectedRoutes.some(route => pathname.startsWith(route))) {
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. منطق مشتری (Customer Logic)
  
  // ⛔️ اگر کاربر لاگین است و می‌خواهد به صفحه لاگین/ثبت‌نام برود -> بفرستش داشبورد
  if (authRoutes.some(route => pathname === route) && customerToken) {
      return NextResponse.redirect(new URL("/account", request.url));
  }

  // 🔒 محافظت از صفحات حساب کاربری
  if (customerProtectedRoutes.some(route => pathname.startsWith(route))) {
    // استثنا: خود صفحات لاگین/ثبت‌نام که در بالا هندل شدند، اما اگر داخل account باشند باید چک شوند
    if (pathname === "/account/login" || pathname === "/account/register") {
        // این شرط عملا با شرط بالا پوشش داده شد ولی برای اطمینان می‌ماند
        if (customerToken) {
             return NextResponse.redirect(new URL("/account", request.url));
        }
        return NextResponse.next();
    }

    if (!customerToken) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};