const name = 'har-axios-tracker';
const suiteName = 'har-axios-tracker-suite';

module.exports = {
  verbose: true,
  name,
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/', '/scripts/'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './testresults/',
        outputName: `junit-${new Date().getTime()}.xml`,
        suiteName,
        titleTemplate: `${suiteName} › {classname} › {title}`,
        ancestorSeparator: ' › '
      }
    ]
  ],
  collectCoverage: true,
  coverageReporters: ['lcov', 'cobertura', 'json']
};
