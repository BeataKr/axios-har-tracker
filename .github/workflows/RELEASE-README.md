# Release and Publishing Workflows

This folder contains workflows for automatic release creation and package publishing.

## Workflows

### 1. `release.yml` - Automatic Releases (Classic)
- **Triggered**: on push to master
- **Conditions**: runs only when version in `package.json` changes
- **Features**:
  - Checks if version has changed
  - Runs tests
  - Creates build
  - Creates Git tag
  - Creates GitHub Release with attachments

## Configuration

### Required Secrets (for NPM)

To enable automatic NPM publishing, you need to add a secret in repository settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `NPM_TOKEN`
   - **Value**: Your NPM access token

#### How to get NPM Token:
```bash
npm login
npm token create --access public
```

### Required Permissions

Workflows require the following permissions:
- `contents: write` - for creating releases and tags
- `id-token: write` - for NPM provenance

## How it works

### Automatic Release Process:

1. **Developer** creates PR with new version in `package.json`
2. **CI** runs tests on PR
3. **Developer** merges PR to master
4. **Release Workflow** automatically:
   - Detects version change
   - Runs tests
   - Creates build
   - Creates Git tag (e.g., `v1.2.3`)
   - Creates GitHub Release
5. **Publish Workflow** automatically:
   - Publishes package to NPM
   - Adds summary

### Example flow for releasing new version:

```bash
# 1. Change version in package.json
npm version patch  # or minor/major

# 2. Create PR
git push origin feature-branch

# 3. Merge PR to master
# 4. GitHub automatically creates release and publishes to NPM!
```

## Usage Examples

### Release patch (1.0.0 → 1.0.1):
```bash
npm version patch
git push origin master
```

### Release new feature (1.0.1 → 1.1.0):
```bash
npm version minor
git push origin master  
```

### Release breaking change (1.1.0 → 2.0.0):
```bash
npm version major
git push origin master
```

## Troubleshooting

### Release is not created:
- Check if version in `package.json` actually changed
- Check if tag with this version doesn't already exist
- Check workflow logs in Actions tab

### NPM publish fails:
- Check if `NPM_TOKEN` is correctly configured
- Check if you have permissions to publish the package
- Check if version doesn't already exist on NPM

## Customization

You can customize workflows by:
- Changing trigger conditions in `on` section
- Modifying steps in `steps`
- Adding additional checks before release
- Changing release notes format