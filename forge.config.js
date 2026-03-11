const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'Video Converter',
    executableName: 'video-converter',
    icon: path.join(__dirname, 'assets', 'icons', 'icon'),
    appBundleId: 'com.videoconverter.app',
    appCategoryType: 'public.app-category.video',
    asar: {
      unpack: '**/node_modules/@ffmpeg-installer/**/*,**/node_modules/@ffprobe-installer/**/*'
    },
    osxSign: {},
    osxNotarize: undefined,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'video_converter',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'your-github-username',
          name: 'video-converter'
        },
        prerelease: false,
        draft: true
      }
    }
  ],
};
