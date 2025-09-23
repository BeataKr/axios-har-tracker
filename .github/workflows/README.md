# GitHub Actions CI/CD

This folder contains GitHub Actions configurations for the axios-har-tracker project.

## Workflows

### 1. `ci.yml` - Basic CI
- **Triggered**: on pull requests and push to master/main
- **Tests**: Node.js 18.x and 20.x on Ubuntu
- **Features**: 
  - Install dependencies
  - Run tests
  - Upload test results and coverage
  - Codecov integration

### 2. `cross-platform.yml` - Cross-platform tests
- **Triggered**: on pull requests and daily at 2:00 UTC
- **Tests**: Node.js 18.x and 20.x on Ubuntu, Windows and macOS
- **Features**:
  - Build project
  - Run tests on different operating systems

### 3. `code-quality.yml` - Code quality control
- **Triggered**: on pull requests
- **Features**:
  - TypeScript compilation check
  - Coverage reporting in PR
  - Upload coverage to Codecov

## Requirements

- Node.js 18.x or 20.x
- All tests must pass successfully
- Coverage is reported but does not block CI

## Codecov Configuration (optional)

To enable Codecov integration:
1. Sign up at https://codecov.io
2. Connect your repository
3. Token is automatically available for public repositories

## Customization

You can customize workflows by:
- Changing Node.js versions in matrix strategy
- Adding new steps in steps
- Modifying trigger conditions in `on`