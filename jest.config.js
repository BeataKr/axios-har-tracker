const suiteName = 'har-axios-tracker-suite';
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
    '/scripts/',
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './testresults/',
        outputName: `junit-${new Date().getTime()}.xml`,
        suiteName,
        titleTemplate: `${suiteName} › {classname} › {title}`,
        ancestorSeparator: ' › ',
      },
    ],
  ],
  collectCoverage: true,
  coverageReporters: [
    'lcov',
    'cobertura',
    'json',
  ],
}
