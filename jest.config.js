const name = "har-axios-tracker";
const suiteName = "har-axios-tracker-suite";

module.exports = {
  verbose: true,
  name,
  testMatch: ["**/+(*.)+(spec|test).+(ts|js)?(x)"],
  moduleFileExtensions: ["ts", "js", "html"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/", "/scripts/"],
  transform: {
    "^.+\\.(ts|js|html)$": "ts-jest",
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./testresults/",
        outputName: `junit-${new Date().getTime()}.xml`,
        suiteName,
        titleTemplate: `${suiteName} › {classname} › {title}`,
        ancestorSeparator: " › ",
      },
    ],
  ],
  coverageDirectory: "coverage",
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{js,ts}",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
