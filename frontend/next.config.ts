import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output:
    process.env.NEXT_OUTPUT_MODE === 'standalone' ? 'standalone' : undefined
}

export default nextConfig
