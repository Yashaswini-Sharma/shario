/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['assets.myntassets.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.myntassets.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
