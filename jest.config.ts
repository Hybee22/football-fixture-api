module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testTimeout: 30000,
  globalSetup: "<rootDir>/test/setup.js",
  // globalTeardown: "<rootDir>/test/teardown.js",
};
