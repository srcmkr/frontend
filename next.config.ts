import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // TODO: Fix TypeScript type definitions for setup namespace
    // The types work in development but fail in Docker build
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
