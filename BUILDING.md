# Building for Multiple Platforms

This guide explains how to build the Video Converter application for Windows, macOS, and Linux.

## Quick Summary

**Current platform only:**
```bash
npm run dist
```

**Specific platforms (with limitations):**
```bash
npm run dist:mac      # macOS only (requires macOS)
npm run dist:win      # Windows (limited on Mac/Linux)
npm run dist:linux    # Linux (works on any platform)
```

**All platforms (recommended):**
Use GitHub Actions or build on each platform separately.

---

## Platform Building Limitations

### Critical Constraints

| Platform | Can Build On | Notes |
|----------|-------------|-------|
| **macOS** (.app, .dmg, .zip) | ✅ macOS only | Requires Xcode, code signing tools |
| **Windows** (.exe, .msi) | ✅ Windows<br>⚠️ Mac/Linux (limited) | Native build recommended |
| **Linux** (.deb, .rpm, .AppImage) | ✅ Any platform | Full cross-platform support |

### Why These Limitations?

- **macOS:** Apple requires builds to be done on macOS with Xcode for code signing
- **Windows:** .exe can be built elsewhere with Wine, but native Windows is more reliable
- **Linux:** No restrictions, can be built anywhere

---

## Option 1: GitHub Actions (Recommended) ⭐

Build all platforms automatically using GitHub's free CI/CD runners.

### Setup (Already Done!)

I've created `.github/workflows/build.yml` which automatically:
- ✅ Builds on macOS, Windows, and Linux
- ✅ Runs when you push a Git tag (e.g., `v1.0.0`)
- ✅ Creates a GitHub Release with all installers
- ✅ Can also be triggered manually

### How to Use

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for release"
   git push origin main
   ```

2. **Create and push a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **GitHub Actions automatically:**
   - Builds on all three platforms
   - Creates installers for each
   - Creates a draft release with all files attached

4. **Review and publish:**
   - Go to your GitHub repo → Releases
   - Find the draft release
   - Add release notes
   - Click "Publish release"

### Manual Trigger

You can also manually trigger builds:
1. Go to your GitHub repo → Actions → "Build and Release"
2. Click "Run workflow"
3. Select branch and run

---

## Option 2: Build Locally on Each Platform

The most reliable method for production builds.

### On macOS (Your Current Machine)

Build for macOS:
```bash
npm run build
npm run dist:mac
```

Output: `release/Video Converter-1.0.0-mac.zip`, `release/Video Converter-1.0.0.dmg`

### On Windows PC

1. Clone the repository
2. Install Node.js 18+
3. Run:
   ```bash
   npm install
   npm run build
   npm run dist:win
   ```

Output: `release/Video Converter Setup 1.0.0.exe`

### On Linux Machine

1. Clone the repository
2. Install Node.js 18+
3. Run:
   ```bash
   npm install
   npm run build
   npm run dist:linux
   ```

Output:
- `release/video-converter_1.0.0_amd64.deb`
- `release/video-converter-1.0.0.AppImage`
- Additional: `release/latest-linux.yml` (for auto-updates)

---

## Option 3: Cross-Platform Building (Limited)

You can attempt to build for other platforms from macOS, but with limitations.

### From macOS: Build Windows Installer (⚠️ Experimental)

Requires Wine to create Windows executables:

1. **Install Wine (if not installed):**
   ```bash
   brew install --cask wine-stable
   ```

2. **Build for Windows:**
   ```bash
   npm run build
   npm run dist:win
   ```

**Limitations:**
- May have signing issues
- NSIS installer works better from Linux/Mac than older Squirrel installer
- Native Windows build still recommended for production

### From macOS: Build Linux Packages (✅ Works)

Linux packages can be built from macOS without issues:

```bash
npm run build
npm run dist:linux
```

This creates .deb and .AppImage packages that work on Linux systems.

---

## Option 4: Docker-Based Builds

You can use Docker to build consistent Linux packages:

### Example Dockerfile

Create `Dockerfile.build`:
```dockerfile
FROM node:18-bullseye

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run dist:linux

CMD ["bash"]
```

### Build with Docker

```bash
docker build -f Dockerfile.build -t video-converter-builder .
docker run --rm -v $(pwd)/release:/app/release video-converter-builder
```

---

## Comparison of Methods

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **GitHub Actions** | ✅ All platforms<br>✅ Automated<br>✅ Free | ⚠️ Requires GitHub | **Production releases** |
| **Local (each platform)** | ✅ Most reliable<br>✅ Full control | ❌ Need 3 machines | **Enterprise/Professional** |
| **Cross-platform** | ✅ One machine | ❌ Limited, experimental | **Testing only** |
| **Docker** | ✅ Consistent<br>✅ Linux only | ❌ No macOS/Windows | **Linux packages** |

---

## Recommended Workflow

### For Development/Testing
```bash
# Build for your current platform only
npm run build
npm run dist
```

### For Production Releases
```bash
# Use GitHub Actions (RECOMMENDED)
git tag v1.0.0
git push origin v1.0.0
# Wait for GitHub to build all platforms
# Review and publish draft release on GitHub
```

### For Enterprise (Maximum Control)
1. Set up three machines (Mac, Windows, Linux) or VMs
2. Build on each platform natively
3. Manually collect and distribute installers

---

## Output Files by Platform

### macOS
```
release/
  ├── Video Converter-1.0.0-mac.zip
  ├── Video Converter-1.0.0.dmg
  ├── Video Converter-1.0.0-mac.zip.blockmap
  └── latest-mac.yml              (auto-update manifest)
```

### Windows
```
release/
  ├── Video Converter Setup 1.0.0.exe
  ├── Video Converter Setup 1.0.0.exe.blockmap
  └── latest.yml                   (auto-update manifest)
```

### Linux
```
release/
  ├── video-converter_1.0.0_amd64.deb
  ├── video-converter-1.0.0.AppImage
  └── latest-linux.yml             (auto-update manifest)
```

---

## Testing Your Builds

### macOS
```bash
# Open and install DMG
open "release/Video Converter-1.0.0.dmg"

# Or extract and run from zip
unzip "release/Video Converter-1.0.0-mac.zip"
open "Video Converter.app"
```

### Windows
```powershell
# Run installer
.\release\Video Converter Setup 1.0.0.exe
```

### Linux (Debian/Ubuntu)
```bash
# Install .deb
sudo dpkg -i release/video-converter_1.0.0_amd64.deb

# Run
video-converter
```

### Linux (AppImage - works on all distros)
```bash
# Make executable and run
chmod +x release/video-converter-1.0.0.AppImage
./release/video-converter-1.0.0.AppImage
```

---

## Troubleshooting

### Build Fails on macOS
- Ensure Xcode Command Line Tools installed: `xcode-select --install`
- Check Node.js version: `node -v` (should be 18+)
- Clean and rebuild: `rm -rf node_modules out dist && npm install && npm run build`

### Windows Build from Mac Fails
- Install Wine: `brew install --cask wine-stable`
- Use native Windows machine instead (recommended)

### Linux Build Missing Dependencies
```bash
# On Debian/Ubuntu
sudo apt-get install rpm

# On macOS
brew install rpm
```

### Out of Memory During Build
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dist
```

---

## CI/CD Integration

### GitHub Actions (Included)
The workflow in `.github/workflows/build.yml` is already set up!

### GitLab CI
Create `.gitlab-ci.yml`:
```yaml
stages:
  - build

build:mac:
  stage: build
  tags: [macos]
  script:
    - npm install
    - npm run build
    - npm run dist:mac

build:windows:
  stage: build
  tags: [windows]
  script:
    - npm install
    - npm run build
    - npm run dist:win

build:linux:
  stage: build
  tags: [linux]
  script:
    - npm install
    - npm run build
    - npm run dist:linux
```

### Jenkins
```groovy
pipeline {
  agent none
  stages {
    stage('Build') {
      parallel {
        stage('macOS') {
          agent { label 'macos' }
          steps {
            sh 'npm install'
            sh 'npm run build'
            sh 'npm run dist:mac'
          }
        }
        stage('Windows') {
          agent { label 'windows' }
          steps {
            bat 'npm install'
            bat 'npm run build'
            bat 'npm run dist:win'
          }
        }
        stage('Linux') {
          agent { label 'linux' }
          steps {
            sh 'npm install'
            sh 'npm run build'
            sh 'npm run dist:linux'
          }
        }
      }
    }
  }
}
```

---

## Summary

**✅ Easiest:** Use GitHub Actions (already configured!)
**✅ Most Reliable:** Build natively on each platform
**⚠️ Experimental:** Cross-platform builds from macOS

For production releases, I strongly recommend using **GitHub Actions** - it's free, automated, and builds on official runners for each platform.

Just run:
```bash
git tag v1.0.0
git push origin v1.0.0
```

And GitHub will build everything for you!
