/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is required for ffmpeg-static to work properly
    if (isServer) {
      config.externals = [...(config.externals || []), 'ffmpeg-static'];
    }

    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          path: false,
          stream: false,
        },
      },
    };
  },
}

module.exports = nextConfig