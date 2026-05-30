import nextConfig from 'eslint-config-next';

const config = [
  { ignores: ['redesign/**', 'dist/**', '.next/**'] },
  ...nextConfig,
  {
    rules: {
      'react/no-array-index-key': 'off',
    },
  },
];

export default config;
