const config = {
  rootDir: "../../",

  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  testMatch: ["<rootDir>/src/Tests/**/*.test.ts"],

  clearMocks: true,

  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testPathIgnorePatterns: ["/dist/", "/node_modules/"],

  // 🔥 THIS is important for ESM + jest globals
  injectGlobals: true,
};

export default config;
