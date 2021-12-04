module.exports = {
  preset: 'ts-jest',
  verbose: false,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    "node_modules/",
    "logs/.*",
    "dist/.*",
    "pacts/.*",
    "coverage/",
    "src/logger/*",
  ],
  watchPathIgnorePatterns: [
    "node_modules/",
    "logs/",
    "dist/",
    "pacts/",
    "coverage/"
  ],
  testResultsProcessor: "jest-sonar-reporter",
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  setupFiles: [
    "jest-plugin-context/setup"
  ],
};

CONVERTER_PORT= '3332'
process.env = Object.assign(process.env, {
  CONVERTER_PORT,
  CONVERTER_URL: `http://localhost:${CONVERTER_PORT}`,
  PORT: '3331'
});
