/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
  },
}
module.exports = nextConfig
