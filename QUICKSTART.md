# Quick Start Guide

## Running the Application

### Windows (PowerShell Execution Policy Issue)

If you encounter "running scripts is disabled" error:

```powershell
# In your PowerShell terminal, run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Then start the app:
.\node_modules\.bin\electron.cmd .
```

### Alternative Method (Works on All Platforms)

```bash
# Build the application
npm run build

# Run electron directly
npx electron .
```

### Development Mode

To run in development mode with hot-reload:

1. Open two terminals

**Terminal 1 - Start Vite dev server:**
```bash
npm run dev:renderer
```

**Terminal 2 - Start Electron (wait for Vite to start first):**
```bash
npm run dev:main
```

## First Time Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Build the application:**
```bash
npm run build
```

3. **Run the app:**
```bash
npx electron .
```

## Using the Application

### Simple Mode (Quick Convert)
1. Drag and drop video files or click to browse
2. Choose a preset:
   - **H.264 720p** - Standard quality, smaller file size
   - **H.264 1080p** - High quality, balanced
   - **H.265 1080p** - Efficient compression, smallest file
   - **Web Optimized** - Perfect for streaming
3. Select output folder
4. Conversion starts automatically!

### Advanced Mode
1. Add video files
2. Click "Advanced" button
3. **Video Tab:**
   - Choose output format (MP4, MKV, AVI, MOV, WebM)
   - Select video codec (H.264, H.265, VP9, etc.)
   - Set resolution (4K, 1080p, 720p, or custom)
   - Adjust quality (CRF slider: 18=high quality, 28=low quality)
   - Set frame rate
   - Choose hardware acceleration (Auto, NVENC, QuickSync, AMF, or CPU)

4. **Audio Tab:**
   - Select audio codec (AAC, MP3, Opus, etc.)
   - Set bitrate (128k, 192k, 320k)
   - Configure channels (2=stereo, 6=5.1 surround)
   - Choose audio track (if multiple available)

5. **Advanced Tab:**
   - Trim video (set start/end times)
   - Embed subtitles
   - Preserve or strip metadata
   - Set custom video bitrate

6. Click "Start Conversion"

### Queue Management
- Switch to "Queue" tab to see all conversions
- View progress bars and statistics
- See file size savings
- Remove failed or completed jobs

## GPU Acceleration

The app automatically detects your hardware:
- ✅ **NVIDIA GPU** - Uses NVENC for fast encoding
- ✅ **Intel CPU** - Uses QuickSync for hardware acceleration
- ✅ **AMD GPU** - Uses AMF encoding
- ⚠️ **CPU Only** - Software encoding (slower but works everywhere)

Check the top-right corner of the app to see what's available.

## Tips for Best Results

1. **For smallest file size:** Use H.265 codec with CRF 28
2. **For best quality:** Use H.264 codec with CRF 18-23
3. **For fast encoding:** Enable GPU acceleration (auto-detect)
4. **For web streaming:** Use the "Web Optimized" preset
5. **For compatibility:** Use H.264 + AAC in MP4 container

## Common Issues

### Video won't load
- Make sure it's a supported format
- Check the console for specific error messages

### Slow conversion
- Enable hardware acceleration if available
- Lower the output resolution
- Increase CRF value (lower quality = faster)

### App won't start
- Make sure Node.js is installed
- Run `npm install` to install dependencies
- Run `npm run build` to compile
- Check for FFmpeg installation errors

## Keyboard Shortcuts

- **Ctrl+O** - Open files (future feature)
- **Ctrl+,** - Settings (future feature)
- **Ctrl+Q** - Quit application

## Building for Distribution

```bash
# Build executables for your platform
npm run make

# Output will be in /out directory
```

## Supported Formats

**Input:** MP4, MKV, AVI, MOV, WebM, M4V, FLV, WMV, MPG, MPEG, 3GP

**Output:** MP4, MKV, AVI, MOV, WebM

**Video Codecs:** H.264, H.265 (HEVC), VP9, AV1, MPEG-4, MPEG-2

**Audio Codecs:** AAC, MP3, Opus, Vorbis, AC3, FLAC
