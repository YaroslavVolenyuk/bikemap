import upleveled from 'eslint-config-upleveled';

const config = [
  ...(await upleveled),
  {
    rules: {
      'react/no-array-index-key': 'off',
    },
  },
];

export default config;
