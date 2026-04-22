/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any domain for avatars/medical illustrations temporarily
      },
    ],
  },
};

export default nextConfig;
