"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
exports.IPC_CHANNELS = {
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
};
