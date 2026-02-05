"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIO_CODECS = exports.VIDEO_CODECS = exports.SUPPORTED_FORMATS = exports.PRESETS = void 0;
exports.PRESETS = [
    {
        id: 'h264-1080p',
        name: 'H.264 1080p',
        description: 'High quality 1080p with H.264 codec',
        settings: {
            videoCodec: 'h264',
            audioCodec: 'aac',
            resolution: { width: 1920, height: 1080 },
            outputFormat: 'mp4',
            crf: 23,
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
            resolution: { width: 1280, height: 720 },
            outputFormat: 'mp4',
            crf: 23,
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
            resolution: { width: 1920, height: 1080 },
            outputFormat: 'mp4',
            crf: 28,
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
            resolution: { width: 1920, height: 1080 },
            outputFormat: 'mp4',
            bitrate: '2000k',
            audioBitrate: '128k',
            preserveMetadata: false,
        },
    },
];
exports.SUPPORTED_FORMATS = {
    video: ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.flv', '.wmv', '.mpg', '.mpeg', '.3gp'],
    output: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
};
exports.VIDEO_CODECS = ['h264', 'hevc', 'vp9', 'av1', 'mpeg4', 'mpeg2video'];
exports.AUDIO_CODECS = ['aac', 'mp3', 'opus', 'vorbis', 'ac3', 'flac'];
