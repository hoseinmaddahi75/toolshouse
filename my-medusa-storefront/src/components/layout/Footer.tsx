import Link from "next/link";
import Image from "next/image";
import BackToTop from "./BackToTop";
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

async function getFooterCategories() {
  try {
    const res = await fetch("http://localhost:9000/store/product-categories", {
      next: { revalidate: 3600 },
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      }
    });
    const data = await res.json();
    return data.product_categories?.slice(0, 5) || [];
  } catch (e) {
    return [];
  }
}

export default async function Footer() {
  const categories = await getFooterCategories();

  const Heading = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 mb-6">
      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
      <h3 className="text-white font-bold text-lg">{text}</h3>
    </div>
  );

  const ListItem = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <li className="mb-3">
      <Link href={href} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all text-sm inline-block">
        {children}
      </Link>
    </li>
  );

  return (
    <footer className="bg-black text-white pt-20 pb-8 mt-auto border-t border-gray-900 relative">
      <div className="w-full px-4 lg:px-[5%] xl:px-[120px]">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 relative">
          
          {/* ستون ۱ */}
          <div className="lg:w-[32%] lg:pl-16 relative">
            
            <div className="mb-6 relative w-40 h-12 rounded-lg">
              <Image 
                src="/images/logo.png" 
                alt="REGAL" 
                fill
                className="object-contain object-right"
                priority
              />
            </div>
            
            <p className="text-gray-400 text-sm leading-7 mb-8 text-justify">
              فروشگاه اینترنتی رگال، با تکیه بر تجربه و سلیقه طراحان برتر، مجموعه‌ای از بهترین پوشاک فصل را برای شما گردآوری کرده است. هدف ما ارائه کیفیت، زیبایی و اصالت در هر خرید است.
            </p>

            <form className="flex flex-col gap-3">
              <label className="text-xs text-gray-500">برای دریافت آخرین اخبار عضو شوید:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="شماره تماس خود را وارد کنید" 
                  className="bg-transparent border border-white/30 text-white text-sm px-4 py-3 rounded-xl w-full focus:outline-none focus:border-white transition-colors placeholder:text-gray-600"
                />
                <button type="button" className="border border-white bg-transparent text-white text-sm px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-colors font-medium whitespace-nowrap">
                  عضویت
                </button>
              </div>
            </form>

            <BackToTop />
          </div>

          {/* 👇 تغییر این خط: استفاده از گرید سفارشی [1fr_1fr_1fr_1.5fr] */}
          <div className="lg:w-[68%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.8fr_0.8fr_0.8fr_2.1fr] gap-8 lg:pr-12">
            
            {/* ستون ۲ */}
            <div>
              <Heading text="لینک‌های کمکی" />
              <ul className="space-y-2">
                <ListItem href="/terms">قوانین و مقررات</ListItem>
                <ListItem href="/privacy">حریم خصوصی</ListItem>
                <ListItem href="/faq">سوالات متداول</ListItem>
                <ListItem href="/track-order">پیگیری سفارش</ListItem>
              </ul>
            </div>

            {/* ستون ۳ */}
            <div>
              <Heading text="محصولات" />
              <ul className="space-y-2">
                {categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <ListItem key={cat.id} href={`/category/${cat.handle}`}>
                      {cat.name}
                    </ListItem>
                  ))
                ) : (
                  <>
                    <ListItem href="/store">ابزار برقی</ListItem>
                    <ListItem href="/store">ابزار شارژی</ListItem>
                    <ListItem href="/store">ابزار دستی</ListItem>
                  </>
                )}
              </ul>
            </div>

            {/* ستون ۴ */}
            <div>
              <Heading text="ارتباط با ما" />
              <ul className="space-y-2">
                <ListItem href="/contact">تماس با ما</ListItem>
                <ListItem href="/about">درباره ما</ListItem>
                <ListItem href="#">چت آنلاین</ListItem>
                <ListItem href="/careers">همکاری با ما</ListItem>
              </ul>
            </div>

            {/* ستون ۵ - حالا عریض‌تر شده است */}
            <div className="lg:col-span-1 min-w-fit">
              <Heading text="اطلاعات تماس" />
              <div className="space-y-6">
                
                <div className="flex items-start gap-3 group">
                  <div className="border border-white/40 rounded-full p-2 group-hover:border-white transition-colors flex-shrink-0">
                    <PhoneIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col ltr text-right pt-1">
                    <span className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">02188204050 , 09123456789</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="border border-white/40 rounded-full p-2 group-hover:border-white transition-colors flex-shrink-0">
                    <EnvelopeIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300 hover:text-white transition-colors font-mono cursor-pointer pt-1">info@toolshouse.com</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="border border-white/40 rounded-full p-2 group-hover:border-white transition-colors flex-shrink-0">
                    <MapPinIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300 leading-6 pt-1">
                    تهران، خیابان ولیعصر، بالاتر از پارک ساعی، کوچه ساعی یکم، پلاک ۱۰
                  </span>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="border border-white/40 rounded-full p-2 group-hover:border-white transition-colors flex-shrink-0">
                    <ClockIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300 pt-1">
                    شنبه تا پنج‌شنبه: ۱۰ تا ۲۱
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* فوتر پایین */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © ۱۴۰۳ تمامی حقوق محفوظ است. طراحی و توسعه توسط{" "}
            <a 
              href="https://disy.agency" 
              target="_blank" 
              rel="nofollow" 
              className="text-white font-bold hover:text-[#B19276] transition-colors"
            >
              منظومه دیجیتال
            </a>
          </p>
          
          <div className="flex items-center gap-6">
            {/* Social Icons ... (بدون تغییر) */}
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity hover:-translate-y-1 duration-300">
              <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" className="text-white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity hover:-translate-y-1 duration-300">
              <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" className="text-white">
                 <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity hover:-translate-y-1 duration-300">
               <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" className="text-white">
                 <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
               </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}