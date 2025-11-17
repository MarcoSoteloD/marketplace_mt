/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dej4viqfd/image/upload/**', // <-- ¡CAMBIA ESTO!
      },
    ],
  },
};

module.exports = nextConfig;