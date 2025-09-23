# GitHub Actions CI/CD

This folder contains GitHub Actions configurations for the axios-har-tracker project.

## Workflows

### CI/CD Workflows

### 1. `ci.yml` - Basic CI
- **Triggered**: on pull requests and push to master
- **Tests**: Node.js 18.x and 20.x on Ubuntu
- **Features**: 
  - Install dependencies
  - Run tests
  - Upload test results and coverage
  - Codecov integration

### 2. `cross-platform.yml` - Cross-platform tests
- **Triggered**: on pull requests
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

### Release Workflows

### 4. `release.yml` - Automatic Releases (Classic)
- **Triggered**: on push to master when package.json version changes
- **Features**:
  - Version change detection
  - Automated testing and building
  - Git tag creation
  - GitHub Release creation with assets

### 5. `release-modern.yml` - Automatic Releases (Modern)
- **Triggered**: on push to master when package.json version changes
- **Features**:
  - Uses latest GitHub Actions
  - Automatic release notes generation
  - Package tarball attachment

### 6. `publish-npm.yml` - NPM Publishing
- **Triggered**: automatically after release creation
- **Features**:
  - Publishes to npmjs.org
  - Adds provenance for security
  - Creates publication summary

## Requirements

- Node.js 18.x or 20.x
- All tests must pass successfully
- Coverage is reported but does not block CI

## Configuration

### For NPM Publishing
Add `NPM_TOKEN` secret in repository settings with your NPM access token.

### For Codecov (optional)
1. Sign up at https://codecov.io
2. Connect your repository
3. Token is automatically available for public repositories

## Automatic Release Process

1. Update version in `package.json` (e.g., `npm version patch`)
2. Create and merge PR to master
3. Release workflow automatically creates GitHub release
4. Publish workflow automatically publishes to NPM

## Customization

You can customize workflows by:
- Changing Node.js versions in matrix strategy
- Adding new steps in steps
- Modifying trigger conditions in `on`
- Adjusting release notes format

For detailed release workflow documentation, see `RELEASE-README.md`.