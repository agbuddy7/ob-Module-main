export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'core/**/*.js',
    '!**/node_modules/**'
  ]
};
