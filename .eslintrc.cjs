/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
const config = {
  extends: ['upleveled'],
  rules: {
    'react/no-array-index-key': 'off',
  },
};

module.exports = config;
