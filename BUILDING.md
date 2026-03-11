# Building for Multiple Platforms

This guide explains how to build the Video Converter application for Windows, macOS, and Linux.

## Quick Summary

**Current platform only:**
```bash
npm run make
```

**Specific platforms (with limitations):**
```bash
npm run make:mac      # macOS only (requires macOS)
npm run make:win      # Windows (limited on Mac/Linux)
npm run make:linux    # Linux (works on any platform)
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
npm run make:mac
```

Output: `out/make/zip/darwin/x64/video-converter-darwin-x64-1.0.0.zip`

### On Windows PC

1. Clone the repository
2. Install Node.js 18+
3. Run:
   ```bash
   npm install
   npm run build
   npm run make:win
   ```

Output:
- `out/make/squirrel.windows/x64/video-converter-1.0.0 Setup.exe`
- `out/make/zip/win32/x64/video-converter-win32-x64-1.0.0.zip`

### On Linux Machine

1. Clone the repository
2. Install Node.js 18+
3. Run:
   ```bash
   npm install
   npm run build
   npm run make:linux
   ```

Output:
- `out/make/deb/x64/video-converter_1.0.0_amd64.deb`
- `out/make/rpm/x64/video-converter-1.0.0-1.x86_64.rpm`
- `out/make/zip/linux/x64/video-converter-linux-x64-1.0.0.zip`

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
   npm run make:win
   ```

**Limitations:**
- May have signing issues
- Not officially supported by Electron Forge
- Native Windows build recommended for production

### From macOS: Build Linux Packages (✅ Works)

Linux packages can be built from macOS without issues:

```bash
npm run build
npm run make:linux
```

This creates .deb and .rpm packages that work on Linux systems.

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
RUN npm run make:linux

CMD ["bash"]
```

### Build with Docker

```bash
docker build -f Dockerfile.build -t video-converter-builder .
docker run --rm -v $(pwd)/out:/app/out video-converter-builder
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
npm run make
```

### For Production Releases
```bash
# Use GitHub Actions
git tag v1.0.0
git push origin v1.0.0
# Wait for GitHub to build all platforms
# Download from Releases page
```

### For Enterprise (Maximum Control)
1. Set up three machines (Mac, Windows, Linux) or VMs
2. Build on each platform natively
3. Manually collect and distribute installers

---

## Output Files by Platform

### macOS
```
out/make/zip/darwin/x64/
  └── video-converter-darwin-x64-1.0.0.zip
```

### Windows
```
out/make/squirrel.windows/x64/
  ├── video-converter-1.0.0 Setup.exe    (installer)
  ├── RELEASES
  └── video-converter-1.0.0-full.nupkg

out/make/zip/win32/x64/
  └── video-converter-win32-x64-1.0.0.zip
```

### Linux
```
out/make/deb/x64/
  └── video-converter_1.0.0_amd64.deb

out/make/rpm/x64/
  └── video-converter-1.0.0-1.x86_64.rpm

out/make/zip/linux/x64/
  └── video-converter-linux-x64-1.0.0.zip
```

---

## Testing Your Builds

### macOS
```bash
# Extract and run
unzip "out/make/zip/darwin/x64/video-converter-darwin-x64-1.0.0.zip"
open video-converter-darwin-x64-1.0.0/video-converter.app
```

### Windows
```powershell
# Run installer
.\out\make\squirrel.windows\x64\video-converter-1.0.0 Setup.exe
```

### Linux (Debian/Ubuntu)
```bash
# Install .deb
sudo dpkg -i out/make/deb/x64/video-converter_1.0.0_amd64.deb

# Run
video-converter
```

### Linux (RedHat/Fedora)
```bash
# Install .rpm
sudo rpm -i out/make/rpm/x64/video-converter-1.0.0-1.x86_64.rpm

# Run
video-converter
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
npm run make
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
    - npm run make:mac

build:windows:
  stage: build
  tags: [windows]
  script:
    - npm install
    - npm run build
    - npm run make:win

build:linux:
  stage: build
  tags: [linux]
  script:
    - npm install
    - npm run build
    - npm run make:linux
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
            sh 'npm run make:mac'
          }
        }
        stage('Windows') {
          agent { label 'windows' }
          steps {
            bat 'npm install'
            bat 'npm run build'
            bat 'npm run make:win'
          }
        }
        stage('Linux') {
          agent { label 'linux' }
          steps {
            sh 'npm install'
            sh 'npm run build'
            sh 'npm run make:linux'
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
