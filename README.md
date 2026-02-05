# Video Converter

A professional desktop video converter application built with Electron, React, and TypeScript. Similar to MiroVideoConverter and Movavi, this application provides powerful video conversion capabilities with GPU acceleration support.

## Features

### Core Features
- ✅ **Multiple Format Support**: Convert between MP4, MKV, AVI, MOV, WebM, and more
- ✅ **H.265 to H.264 Conversion**: Efficiently convert HEVC videos to H.264 at any resolution
- ✅ **GPU Acceleration**: Automatic detection and utilization of hardware encoders:
  - NVIDIA NVENC (CUDA)
  - Intel QuickSync
  - AMD AMF
  - Fallback to CPU encoding
- ✅ **Batch Processing**: Convert multiple files simultaneously
- ✅ **Two Modes**:
  - **Simple Mode**: Quick conversion with presets (720p, 1080p, Web Optimized, etc.)
  - **Advanced Mode**: Full control over encoding parameters

### Advanced Features
- 📹 **Video Preview**: Preview videos before and after conversion
- ✂️ **Video Trimming**: Cut and trim videos to specific time ranges
- 📝 **Subtitle Support**: Embed subtitles from multiple tracks
- 🎵 **Audio Track Selection**: Choose which audio track to keep
- 📊 **Metadata Preservation**: Keep video metadata (title, artist, etc.)
- 🎯 **Custom Resolutions**: Set any resolution (720p, 1080p, 4K, or custom)
- 🔧 **Fine-Grained Control**:
  - CRF (Constant Rate Factor) quality control
  - Custom bitrate settings
  - Frame rate adjustment
  - Audio codec and bitrate selection
  - Sample rate and channel configuration

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React 18**: Modern UI with hooks
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Professional UI components
- **FFmpeg**: Industry-standard video processing
- **fluent-ffmpeg**: Node.js FFmpeg wrapper

## Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd video-converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

This will start both the Vite dev server (React) and Electron in development mode.

## Usage

### Simple Mode (Quick Convert)
1. Click or drag-and-drop video files into the application
2. Choose a preset (H.264 720p, H.264 1080p, etc.)
3. Select output folder
4. Conversion starts automatically!

### Advanced Mode
1. Add video files
2. Click "Advanced" button on any file
3. Configure detailed settings:
   - **Video Tab**: Format, codec, resolution, quality (CRF), FPS, hardware acceleration
   - **Audio Tab**: Audio codec, bitrate, channels, sample rate, track selection
   - **Advanced Tab**: Trimming, subtitle embedding, metadata, custom bitrate
4. Start conversion

### Batch Processing
- Add multiple files at once
- Each file can have different settings
- Monitor all conversions in the Queue tab
- View progress, estimated time, and file size savings

## Building for Production

### Build the application:
```bash
npm run build
```

### Package for distribution:
```bash
npm run make
```

This will create installers for your platform in the `out` directory.

## Project Structure

```
video-converter/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # Main entry point
│   │   ├── preload.ts       # Preload script for IPC
│   │   └── videoProcessor.ts # FFmpeg video processing logic
│   ├── renderer/            # React application
│   │   ├── components/      # React components
│   │   │   ├── FileSelector.tsx
│   │   │   ├── ConversionQueue.tsx
│   │   │   ├── ConversionSettingsDialog.tsx
│   │   │   └── SettingsPanel.tsx
│   │   ├── App.tsx          # Main React component
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles
│   └── shared/              # Shared types and constants
│       ├── types.ts         # TypeScript interfaces
│       └── constants.ts     # IPC channel names
├── package.json
├── tsconfig.json            # Renderer TypeScript config
├── tsconfig.main.json       # Main process TypeScript config
├── vite.config.ts           # Vite configuration
└── README.md
```

## Supported Formats

### Input Formats
- MP4, MKV, AVI, MOV, WebM, M4V, FLV, WMV, MPG, MPEG, 3GP

### Output Formats
- MP4, MKV, AVI, MOV, WebM

### Video Codecs
- H.264 (AVC)
- H.265 (HEVC)
- VP9
- AV1
- MPEG-4
- MPEG-2

### Audio Codecs
- AAC
- MP3
- Opus
- Vorbis
- AC3
- FLAC

## Hardware Acceleration

The application automatically detects available hardware encoders:

- **NVIDIA GPUs**: Uses NVENC for H.264/H.265 encoding
- **Intel CPUs**: Uses QuickSync Video for hardware encoding
- **AMD GPUs**: Uses AMF (Advanced Media Framework)
- **Fallback**: Software encoding with libx264/libx265

Hardware acceleration can provide 2-5x faster encoding speeds with lower CPU usage.

## Platform Support

- ✅ Windows 10/11 (x64)
- ✅ macOS 10.13+ (Intel and Apple Silicon)
- ✅ Linux (x64)

## Performance Tips

1. **Use Hardware Acceleration**: Set to "Auto Detect" for best performance
2. **CRF Quality**: 
   - 18-22: High quality (larger files)
   - 23-28: Balanced (recommended)
   - 28+: Lower quality (smaller files)
3. **Resolution**: Downscaling (4K → 1080p) significantly reduces file size
4. **Batch Processing**: Add all files at once for efficient queue management

## Troubleshooting

### Video not loading
- Ensure FFmpeg is properly bundled (should be automatic)
- Check console for error messages

### Hardware acceleration not working
- Update GPU drivers
- Verify GPU supports hardware encoding
- Try "CPU Only" mode as fallback

### Slow conversion speeds
- Enable hardware acceleration if available
- Lower CRF value increases quality but slows conversion
- Close other applications to free up resources

## Development

### Available Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run package` - Package application
- `npm run make` - Create distributable installers
- `npm run dev:renderer` - Start Vite dev server only
- `npm run dev:main` - Compile and run Electron main process

### Debug Mode

Launch with DevTools open:
- The application automatically opens DevTools in development mode
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to toggle

## License

MIT License - see LICENSE file for details

## Credits

- Built with [Electron](https://www.electronjs.org/)
- Video processing by [FFmpeg](https://ffmpeg.org/)
- UI components from [Material-UI](https://mui.com/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
