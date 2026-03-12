# Icon Setup Guide

## Step 1: Save Your Icon Files

You have two PNG icon files (256px and 512px). Please save them to this `assets/` folder:

1. **Rename the 512px version** to: `icon.png`
2. **Rename the 256px version** to: `icon-256.png`

Your assets folder should look like:
```
assets/
├── icon.png (512x512)
├── icon-256.png (256x256)
└── ICON-SETUP.md (this file)
```

## Step 2: Generate Platform-Specific Icons

Run this command to automatically generate `.icns` (macOS) and `.ico` (Windows) formats:

```bash
npm run build:icons
```

This will create:
- `icons/icon.icns` - for macOS
- `icons/icon.ico` - for Windows
- `icons/` folder with various sizes for different platforms

## Step 3: Rebuild Your Application

After the icons are generated, rebuild:

```bash
npm run build
npm run dist
```

## What Each Icon Format Does

- **icon.png** (512x512) - Source file in assets/, used for generating other formats
- **icons/icon.icns** - macOS app icon (shown in dock, Finder, etc.)
- **icons/icon.ico** - Windows app icon (shown in taskbar, file explorer, etc.)
- **icons/** folder - Contains all generated sizes (16x16 to 1024x1024)

## Alternative: Manual Conversion

If `npm run build:icons` doesn't work, you can convert manually:

### For macOS (.icns):
1. Use online converter: https://cloudconvert.com/png-to-icns
2. Upload your 512px PNG
3. Download the .icns file
4. Save as `assets/icons/icon.icns`

### For Windows (.ico):
1. Use online converter: https://convertio.co/png-ico/
2. Upload your 256px PNG (or 512px for better quality)
3. Select "256x256" size
4. Download the .ico file
5. Save as `assets/icons/icon.ico`

## Troubleshooting

**Icons not showing after build?**
- Make sure source PNGs are in the `assets/` folder
- Verify `assets/icons/` folder was created with .icns and .ico files
- Rebuild completely: `npm run build && npm run dist`
- Check file names match exactly in `assets/icons/`: `icon.icns`, `icon.ico`

**Build errors?**
- Ensure PNG files are valid
- Try manual conversion if automated tool fails
- Check file permissions

## Icon Configuration Locations

Your icons are configured in:
1. **package.json** - build.mac.icon and build.win.icon fields point to `assets/icons/icon.icns` and `assets/icons/icon.ico`
2. **src/main/main.ts** - BrowserWindow icon property points to `assets/icons/512x512.png`
3. **package.json** - build:icons script

The system automatically uses the right format for each platform!
