module.exports = {
  packagerConfig: {
    name: 'Video Converter',
    executableName: 'video-converter',
    icon: './assets/icon',
    asar: {
      unpack: '**/node_modules/@ffmpeg-installer/**/*,**/node_modules/@ffprobe-installer/**/*'
    },
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
};
