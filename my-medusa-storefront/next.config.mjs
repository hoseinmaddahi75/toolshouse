/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
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
      // 👇 این ۴ خط اضافه شد تا استورفرانت بتونه به بک‌اند داخلی داکر وصل بشه 👇
      {
        protocol: "http",
        hostname: "backend",
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