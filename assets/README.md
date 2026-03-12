# Application Icons

This folder contains the application icons for all platforms.

## Quick Setup

**See ICON-SETUP.md for detailed instructions!**

## Required Files

- **icon.png** (512x512) - Source file in assets/ folder
- **icons/icon.icns** - macOS app icon (auto-generated)
- **icons/icon.ico** - Windows app icon (auto-generated)
- **icons/** folder - Contains all platform-specific icons

## How to Generate Icons

1. Save your 512px PNG as `icon.png` in this folder
2. Run: `npm run build:icons`
3. This will automatically generate `.icns` and `.ico` files

## Current Status

✅ Icon configuration is set up in:
- package.json (build.mac.icon and build.win.icon)
- src/main/main.ts
- package.json (build:icons script)

📝 You need to:
1. Save your PNG files to this folder (see ICON-SETUP.md)
2. Run `npm run build:icons`
3. Rebuild the app
