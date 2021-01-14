/* eslint-disable import/no-extraneous-dependencies */
/**
 * https://github.com/facebook/jest/issues/2418#issuecomment-423806659
 */
const { join } = require('path');
const globby = require('globby');

const libCoverage = require('istanbul-lib-coverage');
const { createReporter } = require('istanbul-api');

const map = libCoverage.createCoverageMap();

const normalizeJestCoverage = obj => {
  const result = obj;
  Object.entries(result).forEach(([k, v]) => {
    if (v.data) result[k] = v.data;
  });
  return result;
};

async function run() {
  const paths = await globby(['coverage/**/coverage-final.json', '!**/node_modules']);

  paths.forEach(path => {
    const coverage = require(join(process.cwd(), path));
    map.merge(normalizeJestCoverage(coverage));
  });

  const reporter = createReporter();
  reporter.addAll(['cobertura', 'lcov', 'text']);
  reporter.write(map);
}

run();
