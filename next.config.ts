import type { NextConfig } from 'next';
const config: NextConfig = { distDir: ".next-build", output: 'export', trailingSlash: true, images: { unoptimized: true } };
export default config;
