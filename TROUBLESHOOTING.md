# Troubleshooting Guide

## Common Issues and Solutions

### 1. PowerShell Execution Policy Error (Windows)

**Error:** `File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
# Open PowerShell in the project directory
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Then run:
npm install  # or npm start, etc.
```

**Alternative:** Use Command Prompt (cmd) instead of PowerShell

### 2. App Won't Start

**Symptoms:** Nothing happens when running `npm start`

**Solutions:**
1. Make sure dependencies are installed:
   ```bash
   npm install
   ```

2. Build the application first:
   ```bash
   npm run build
   ```

3. Run electron directly:
   ```bash
   npx electron .
   # or
   .\node_modules\.bin\electron.cmd .
   ```

### 3. Module Not Found Errors

**Error:** `Cannot find module '../shared/config'` or similar

**Solution:**
```bash
# Clean and rebuild
Remove-Item -Recurse -Force dist
npm run build
```

### 4. FFmpeg Not Found

**Error:** FFmpeg related errors during conversion

**Solution:**
- FFmpeg should be bundled via `@ffmpeg-installer/ffmpeg`
- Reinstall dependencies:
  ```bash
  npm install @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe
  ```

### 5. GPU Acceleration Not Working

**Symptoms:** Hardware encoders show as unavailable

**Solutions:**
1. **Update GPU Drivers:**
   - NVIDIA: Download from nvidia.com
   - Intel: Update from intel.com
   - AMD: Download from amd.com

2. **Check GPU Support:**
   - NVIDIA: Requires GTX 600 series or newer
   - Intel: Requires 2nd gen Core or newer
   - AMD: Requires GCN architecture or newer

3. **Fallback:** Use "CPU Only" option in settings

### 6. Video Won't Convert

**Symptoms:** Conversion fails immediately or gets stuck

**Solutions:**
1. **Check Input File:**
   - Make sure file isn't corrupted
   - Try with a different video file
   - Check file permissions

2. **Check Output Path:**
   - Make sure you have write permissions
   - Ensure enough disk space

3. **Try Different Settings:**
   - Use a preset instead of custom settings
   - Change hardware acceleration to "CPU Only"
   - Reduce output resolution

### 7. Slow Conversion Speed

**Symptoms:** Conversion takes too long

**Solutions:**
1. **Enable GPU Acceleration:**
   - Go to Settings tab
   - Set to "Auto Detect"
   - Restart conversion

2. **Adjust Quality:**
   - Higher CRF = faster (but lower quality)
   - Try CRF 28 instead of 18

3. **Lower Resolution:**
   - Convert 4K to 1080p or 720p
   - Reduces processing time significantly

4. **Close Other Apps:**
   - Free up CPU/GPU resources

### 8. File Size Too Large

**Symptoms:** Output file is bigger than input

**Solutions:**
1. **Increase CRF Value:**
   - Higher CRF = smaller file size
   - Try 28-32 for small files

2. **Use H.265 Codec:**
   - Better compression than H.264
   - Can be 30-50% smaller

3. **Lower Resolution:**
   - 1080p instead of 4K
   - 720p for web use

4. **Reduce Bitrate:**
   - In Advanced settings
   - Try 2000k for 1080p
   - Try 1000k for 720p

### 9. Audio Out of Sync

**Symptoms:** Audio doesn't match video

**Solutions:**
1. **Preserve Original Frame Rate:**
   - Don't change FPS setting
   - Use original FPS

2. **Check Input File:**
   - May be issue with source video
   - Try different input

3. **Use Different Audio Codec:**
   - Try AAC if using others
   - Match original audio codec

### 10. Build Errors

**Error:** TypeScript or Vite build errors

**Solutions:**
1. **Clear Cache:**
   ```bash
   Remove-Item -Recurse -Force dist
   Remove-Item -Recurse -Force node_modules
   npm install
   npm run build
   ```

2. **Check Node Version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Update Dependencies:**
   ```bash
   npm update
   ```

### 11. Black Screen on Launch

**Symptoms:** App opens but shows blank/black window

**Solutions:**
1. **Check Console:**
   - Open DevTools (Ctrl+Shift+I)
   - Look for JavaScript errors

2. **Rebuild Renderer:**
   ```bash
   npm run build:renderer
   ```

3. **Clear Cache:**
   - Close app completely
   - Delete `dist/renderer` folder
   - Run `npm run build:renderer`

### 12. Conversion Stuck at 0%

**Symptoms:** Progress bar doesn't move

**Solutions:**
1. **Wait Longer:**
   - Large files take time to start
   - Check task manager for CPU/GPU usage

2. **Check File:**
   - Make sure input file is valid
   - Try smaller test file first

3. **Restart App:**
   - Close and reopen application
   - Try conversion again

### 13. Memory Issues

**Symptoms:** App crashes with large files

**Solutions:**
1. **Process Smaller Files:**
   - Split large videos first
   - Convert in batches

2. **Lower Resolution:**
   - Process at 1080p instead of 4K

3. **Close Other Apps:**
   - Free up RAM

4. **Increase Node Memory:**
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   npm start
   ```

### 14. Subtitle Not Embedding

**Symptoms:** Subtitles missing in output

**Solutions:**
1. **Check Subtitle Format:**
   - Use .srt or embedded subtitles
   - External .ass/.ssa may not work

2. **Select Correct Track:**
   - Choose subtitle track in Advanced settings

3. **Use MP4 or MKV:**
   - Not all formats support subtitles

### 15. Can't Package Application

**Error:** `npm run dist` fails

**Solutions:**
1. **Build First:**
   ```bash
   npm run build
   ```

2. **Check electron-builder:**
   ```bash
   npm install electron-builder --save-dev
   ```

3. **Platform-Specific:**
   - Windows: Requires Windows SDK
   - macOS: Requires Xcode
   - Linux: May need build tools (fakeroot, dpkg)

## Getting Help

If you're still having issues:

1. **Check Console Output:**
   - Look for specific error messages
   - Note any warnings

2. **Enable DevTools:**
   - Press Ctrl+Shift+I (Windows/Linux)
   - Press Cmd+Option+I (macOS)
   - Check Console and Network tabs

3. **Test with Simple File:**
   - Try converting a small, simple video
   - Helps isolate the problem

4. **Check System Requirements:**
   - Windows 10+, macOS 10.13+, or recent Linux
   - Node.js 18+
   - 4GB+ RAM recommended
   - 1GB+ free disk space

## Debug Mode

Enable detailed logging:

1. **Open DevTools** (Ctrl+Shift+I)
2. **Check Console** for errors
3. **Monitor Network** for IPC issues
4. **Check Application** tab for storage

## Performance Optimization

For best performance:

1. ✅ Use SSD instead of HDD
2. ✅ Enable hardware acceleration
3. ✅ Close unnecessary applications
4. ✅ Use appropriate quality settings
5. ✅ Process files in reasonable batches (5-10 at a time)

## Still Need Help?

Create an issue with:
- Your operating system and version
- Node.js version (`node --version`)
- Complete error message
- Steps to reproduce
- Screenshots if applicable
