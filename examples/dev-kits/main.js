module.exports = {
  stories: [`${__dirname}/stories/*.*`],
  addons: [
    '@storybook/addon-roundtrip/register',
    '@storybook/addon-parameter/register',
    '@storybook/addon-preview-wrapper/register',
  ],
  refs: {
    inception: 'https://storybookjs-next.now.sh/dev-kits/iframe.html',
  },
  webpack: async config => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(ts|tsx)$/,
          loader: require.resolve('babel-loader'),
          options: {
            presets: [['react-app', { flow: false, typescript: true }]],
          },
        },
      ],
    },
    resolve: {
      ...config.resolve,
      extensions: [...(config.resolve.extensions || []), '.ts', '.tsx'],
    },
  }),
  managerWebpack: async config => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /manager\.js$/,
          loader: require.resolve('babel-loader'),
          options: {
            presets: [['react-app', { flow: false, typescript: true }]],
          },
        },
      ],
    },
  }),
};
