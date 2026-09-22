const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  {
    ignores: ['node_modules/**', 'ios/**', 'android/**', '.expo/**', 'coverage/**'],
  },
];
