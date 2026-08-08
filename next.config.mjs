/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No remote images, no image optimisation: this app ships zero image assets.
  images: { unoptimized: true },
};

export default nextConfig;
