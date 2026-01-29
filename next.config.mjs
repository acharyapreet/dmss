/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Empty turbopack config to silence warnings
  turbopack: {},
  // Enable compression
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
}

export default nextConfig
