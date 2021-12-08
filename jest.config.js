module.exports = {
  preset: 'ts-jest',
  verbose: false,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    'node_modules/',
    'logs/.*',
    'dist/.*',
    'pacts/.*',
    'coverage/',
    'src/logger/*',
    'src/tracer/*',
    'src/util/opentracing/*',
  ],
  watchPathIgnorePatterns: [
    'node_modules/',
    'logs/',
    'dist/',
    'pacts/',
    'coverage/',
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  setupFiles: ['jest-plugin-context/setup'],
};

process.env = Object.assign(process.env, {
  CONVERTER_PORT: '3332',
  CONVERTER_URL: `http://localhost:3332`,
  PORT: '3331',
});
