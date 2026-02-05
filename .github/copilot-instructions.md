# Video Converter Application - Copilot Instructions

## Project Overview
Electron desktop application with React and TypeScript for professional video conversion, similar to MiroVideoConverter and Movavi.

## Core Features
- Video format conversion with bundled FFmpeg
- H.265 to H.264 conversion with custom resolutions
- Batch processing support
- GPU acceleration (NVIDIA NVENC, Intel QuickSync, AMD VCE) with CPU fallback
- Simple mode (presets) and Advanced mode (full control)
- Multiple format support: H.264, H.265, AVI, MOV, WebM, MP4, MKV
- Video preview before/after conversion
- Video trimming/cutting
- Subtitle handling and embedding
- Audio track selection
- Metadata preservation

## Technology Stack
- Electron with React and TypeScript
- FFmpeg via fluent-ffmpeg
- Cross-platform: Windows, macOS, Linux
- Modern UI with Material-UI

## Project Structure
- src/main - Electron main process
- src/renderer - React application
- src/shared - Shared types and utilities
- IPC communication between processes

## Development Status
✅ Copilot instructions created
✅ Project scaffolding complete
✅ All features implemented
✅ Dependencies installed and compiled
✅ Application tested and running
✅ Documentation finalized

## Quick Commands

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run the application (Windows PowerShell)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\node_modules\.bin\electron.cmd .

# Or use npx
npx electron .

# Development mode
npm run dev:renderer  # Terminal 1
npm run dev:main      # Terminal 2 (after Vite starts)

# Package for distribution
npm run make
```

## Project Files
- **Main Process**: src/main/*.ts
- **React UI**: src/renderer/**/*.tsx  
- **Shared Code**: src/shared/*.ts
- **Documentation**: README.md, QUICKSTART.md, TROUBLESHOOTING.md, PROJECT_SUMMARY.md
