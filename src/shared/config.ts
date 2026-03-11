import type { ConversionPreset } from './types';

export const PRESETS: ConversionPreset[] = [
  {
    id: 'h264-1080p',
    name: 'H.264 1080p',
    description: 'High quality 1080p with H.264 codec',
    settings: {
      videoCodec: 'h264',
      audioCodec: 'aac',
      audioMode: 'convert',
      resolution: { width: 1920, height: 1080 },
      outputFormat: 'mp4',
      crf: 23,
      audioBitrate: '192k',
      audioChannels: 2,
      preserveMetadata: true,
    },
  },
  {
    id: 'h264-720p',
    name: 'H.264 720p',
    description: 'Standard quality 720p with H.264 codec',
    settings: {
      videoCodec: 'h264',
      audioCodec: 'aac',
      audioMode: 'convert',
      resolution: { width: 1280, height: 720 },
      outputFormat: 'mp4',
      crf: 23,
      audioBitrate: '192k',
      audioChannels: 2,
      preserveMetadata: true,
    },
  },
  {
    id: 'h265-1080p',
    name: 'H.265 1080p (HEVC)',
    description: 'Efficient 1080p with H.265 codec',
    settings: {
      videoCodec: 'hevc',
      audioCodec: 'aac',
      audioMode: 'convert',
      resolution: { width: 1920, height: 1080 },
      outputFormat: 'mp4',
      crf: 28,
      audioBitrate: '192k',
      audioChannels: 2,
      preserveMetadata: true,
    },
  },
  {
    id: 'web-optimized',
    name: 'Web Optimized',
    description: 'Optimized for web streaming',
    settings: {
      videoCodec: 'h264',
      audioCodec: 'aac',
      audioMode: 'convert',
      resolution: { width: 1920, height: 1080 },
      outputFormat: 'mp4',
      bitrate: '2000k',
      audioBitrate: '128k',
      audioChannels: 2,
      preserveMetadata: false,
    },
  },
];

export const SUPPORTED_FORMATS = {
  video: ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.flv', '.wmv', '.mpg', '.mpeg', '.3gp'],
  output: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
};

export const VIDEO_CODECS = ['h264', 'hevc', 'vp9', 'av1', 'mpeg4', 'mpeg2video'];
export const AUDIO_CODECS = ['aac', 'mp3', 'opus', 'vorbis', 'ac3', 'flac'];

export const IPC_CHANNELS = {
  // File operations
  SELECT_INPUT_FILES: 'select-input-files',
  SELECT_OUTPUT_FOLDER: 'select-output-folder',
  
  // Video info
  GET_VIDEO_INFO: 'get-video-info',
  
  // Conversion
  START_CONVERSION: 'start-conversion',
  CANCEL_CONVERSION: 'cancel-conversion',
  CONVERSION_PROGRESS: 'conversion-progress',
  CONVERSION_COMPLETE: 'conversion-complete',
  CONVERSION_ERROR: 'conversion-error',
  
  // Hardware info
  GET_HARDWARE_INFO: 'get-hardware-info',
  
  // Queue management
  GET_QUEUE: 'get-queue',
  REMOVE_FROM_QUEUE: 'remove-from-queue',
  CLEAR_QUEUE: 'clear-queue',
  
  // Settings
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  
  // Preview
  GENERATE_THUMBNAIL: 'generate-thumbnail',
  
  // Auto-updates
  CHECK_FOR_UPDATES: 'check-for-updates',
  DOWNLOAD_UPDATE: 'download-update',
  INSTALL_UPDATE: 'install-update',
  GET_APP_VERSION: 'get-app-version',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_NOT_AVAILABLE: 'update-not-available',
  UPDATE_DOWNLOAD_PROGRESS: 'update-download-progress',
  UPDATE_DOWNLOADED: 'update-downloaded',
  UPDATE_ERROR: 'update-error',
} as const;
