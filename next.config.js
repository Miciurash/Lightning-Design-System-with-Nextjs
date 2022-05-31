/** @type {import('next').NextConfig} */

const path = require('node:path')

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {

    // Fixes the slds style dependencies
    config.module.rules.push(
      {
        test: /\.jsx?$/,
        include: [
          'node_modules/@salesforce/design-system-react',
        ].map(
          someDir => path.resolve(
            process.cwd(),
            someDir
          )
        ),
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
          ]
        }
      });
    //
    
    config.module.rules.push({
      test: /\.svg$/i,
      // issuer section restricts svg as component only to
      // svgs imported from js / ts files.
      //
      // This allows configuring other behavior for
      // svgs imported from other file types (such as .css)
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: { plugins: [{ removeViewBox: false }] },
          },
        },
      ],
    });

    return config
  },
}

module.exports = nextConfig
