module.exports = {
  experimental: {
    esmExternals: false, // or add ffmpeg-static to externals in webpack if needed
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('ffmpeg-static');
    }
    return config;
  }
}