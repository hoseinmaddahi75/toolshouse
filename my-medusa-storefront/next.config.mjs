/** @type {import('next').NextConfig} */
const nextConfig = {
  // تایپ‌اسکریپت هنوز پشتیبانی می‌شود
  typescript: {
    ignoreBuildErrors: true,
  },
  // تنظیمات تصاویر
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;