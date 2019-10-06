module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  collectCoverageFrom: ["**/*/*.{js,jsx,ts,tsx}", "!**/node_modules/**", "!**/vendor/**"],
  coverageReporters: ["lcov", "text"],
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
