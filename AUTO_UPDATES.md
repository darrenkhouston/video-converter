# Auto-Updates Guide

## Overview

The Video Converter app now includes automatic update functionality! Users will be notified when new versions are available and can download and install updates directly from within the app.

## How It Works

### For Users

1. **Automatic Checks**: The app automatically checks for updates every 4 hours
2. **Manual Check**: Click "Check for Updates" in the Settings tab
3. **Notification**: When an update is available, a dialog will appear with:
   - New version number
   - Release date
   - Release notes (what's new)
4. **Download**: Click "Download Update" to download in the background
5. **Install**: Once downloaded, click "Restart & Install" to update

### Features

- ✅ **Automatic background checking** - Checks every 4 hours after app starts
- ✅ **Manual check** - Button in Settings panel
- ✅ **Download progress** - See download percentage and speed
- ✅ **Install when ready** - Option to install now or later
- ✅ **Auto-install on quit** - Updates install when you close the app
- ✅ **Release notes** - See what's new before updating

## For Developers

### How Auto-Update is Configured

The auto-update system uses **electron-updater** which supports:
- GitHub Releases (recommended)
- Generic HTTP server
- Amazon S3
- Custom providers

### Current Setup

**Update Check Configuration:**
- Location: `src/main/autoUpdater.ts`
- Check frequency: Every 4 hours (configurable)
- First check: 10 seconds after app starts

**Publishing Configuration:**
- Location: `package.json` (build.publish section)
- Provider: GitHub Releases
- Automated via GitHub Actions workflow

### Publishing Updates

#### Step 1: Update Version Number

```bash
# In package.json, increment the version:
"version": "1.0.1"  # or "1.1.0" for minor, "2.0.0" for major
```

#### Step 2: Build & Package

```bash
npm run build
npm run dist
```

#### Step 3: Publish to GitHub

**Option A: Using GitHub Releases (Manual)**
1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.1` (must match package.json version)
4. Upload the built files from `release/`:
   - `*.zip` and `*.dmg` for macOS
   - `*.exe` for Windows
   - `*.deb`, `*.rpm`, or `*.AppImage` for Linux
   - **Important:** Include `latest-mac.yml`, `latest-linux.yml`, and `latest.yml` files
5. Add release notes describing changes
6. Publish the release

**Option B: Using GitHub Actions (Automated)**
1. Set up GitHub Actions workflow (already configured in `.github/workflows/build.yml`)
2. Push a tag: `git tag v1.0.1 && git push --tags`
3. GitHub Actions will automatically build and publish

#### Step 4: Users Get Notified

- electron-updater checks GitHub releases for new versions
- Compares with current app version
- Notifies users if newer version is available

### Configuration Files

**package.json**
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "your-github-username",
    "repo": "video-converter"
  }
}
```

**src/main/autoUpdater.ts**
```typescript
const GITHUB_OWNER = 'your-github-username';
const GITHUB_REPO = 'video-converter';
```

**package.json**
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-github-username/video-converter.git"
  }
}
```

### Testing Updates Locally

#### Method 1: Test with Dev Inspector
```bash
# In development mode, updates are disabled
# To test, build production version:
npm run build
npm run package

# Run the packaged app (not npm start)
open "out/Video Converter-darwin-x64/Video Converter.app"
```

#### Method 2: Mock Update Server
Use `electron-updater-dev-server` to test locally without publishing.

### Update Channels

You can support multiple update channels (stable, beta, alpha):

```typescript
// In autoUpdater.ts
autoUpdater.channel = 'beta';  // or 'stable', 'alpha'
```

Then publish releases with pre-release tags:
- `v1.0.1` → stable channel
- `v1.1.0-beta.1` → beta channel
- `v1.2.0-alpha.1` → alpha channel

## Security

### Code Signing

For production, you should code sign your app:

**macOS:**
```javascript
// In package.json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)",
    "hardenedRuntime": true,
    "entitlements": "entitlements.plist",
    "entitlementsInherit": "entitlements.plist"
  }
}
```

**Windows:**
```javascript
// In package.json
"build": {
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "password"
  }
}
}
```

### Verifying Updates

electron-updater automatically verifies update integrity using:
- Code signatures (when app is signed)
- Checksums (SHA-512)

## Troubleshooting

### Updates Not Working?

**Check these:**

1. **Version mismatch**: Ensure package.json version < published version
2. **Repository URL**: Verify GitHub repo URL in package.json is correct
3. **Release published**: Check GitHub releases are not drafts
4. **Assets uploaded**: Ensure platform files (.zip, .exe) are in the release
5. **Network**: Check internet connection and GitHub accessibility

**View Logs:**
- macOS: `~/Library/Logs/video-converter/main.log`
- Windows: `%USERPROFILE%\AppData\Roaming\video-converter\logs\main.log`
- Linux: `~/.config/video-converter/logs/main.log`

### Development Mode

Updates are automatically disabled in development mode:
```typescript
if (process.env.NODE_ENV !== 'development') {
  updater = new AutoUpdater(mainWindow);
}
```

## Alternative Update Providers

### Using a Custom Server

```typescript
// In autoUpdater.ts
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://your-update-server.com/releases'
});
```

Your server should provide:
- `latest.yml` (macOS)
- `latest-linux.yml` (Linux)
- `latest.xml` (Windows)

### Using Amazon S3

```typescript
autoUpdater.setFeedURL({
  provider: 's3',
  bucket: 'your-bucket-name',
  region: 'us-east-1'
});
```

## Best Practices

1. **Always increment version** - Semantic versioning (MAJOR.MINOR.PATCH)
2. **Write clear release notes** - Users appreciate knowing what changed
3. **Test before publishing** - Build and test locally first
4. **Use draft releases** - Review before making public
5. **Code sign your app** - Required for macOS, recommended for Windows
6. **Keep update frequency reasonable** - Don't annoy users with daily checks
7. **Respect user choice** - Let them update later if they want

## Update Workflow Summary

```bash
# 1. Update version
# Edit package.json: "version": "1.0.1"

# 2. Build application
npm run build
npm run dist

# 3. Publish to GitHub
# Either manually upload to GitHub Releases
# or use: npm run release (with GH_TOKEN set)

# 4. Users automatically notified
# App checks for updates and shows dialog
```

## Future Enhancements

Possible improvements:
- [ ] Add silent updates (download in background, install on quit)
- [ ] Support delta updates (only download changed files)
- [ ] Add update rollback feature
- [ ] Implement update mirrors for reliability
- [ ] Add update analytics (track adoption rate)

## References

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [GitHub Releases Guide](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Electron Code Signing](https://www.electron.build/code-signing)
