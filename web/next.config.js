/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true, // use babel emotion mainly to enable https://emotion.sh/docs/styled#targeting-another-emotion-component
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
