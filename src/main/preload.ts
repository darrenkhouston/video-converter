import { contextBridge, ipcRenderer } from 'electron';
import type { ConversionSettings, VideoFile, ConversionJob, HardwareInfo, FFmpegProgress } from '../shared/types';

// IPC channel constants - duplicated here to avoid require issues in preload
const IPC_CHANNELS = {
  SELECT_INPUT_FILES: 'select-input-files',
  SELECT_OUTPUT_FOLDER: 'select-output-folder',
  GET_VIDEO_INFO: 'get-video-info',
  START_CONVERSION: 'start-conversion',
  CANCEL_CONVERSION: 'cancel-conversion',
  CONVERSION_PROGRESS: 'conversion-progress',
  CONVERSION_COMPLETE: 'conversion-complete',
  CONVERSION_ERROR: 'conversion-error',
  GET_HARDWARE_INFO: 'get-hardware-info',
  GET_QUEUE: 'get-queue',
  REMOVE_FROM_QUEUE: 'remove-from-queue',
  CLEAR_QUEUE: 'clear-queue',
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  GENERATE_THUMBNAIL: 'generate-thumbnail',
} as const;

contextBridge.exposeInMainWorld('electron', {
  // File operations
  selectInputFiles: (): Promise<string[]> => 
    ipcRenderer.invoke(IPC_CHANNELS.SELECT_INPUT_FILES),
  
  selectOutputFolder: (): Promise<string> => 
    ipcRenderer.invoke(IPC_CHANNELS.SELECT_OUTPUT_FOLDER),
  
  // Video info
  getVideoInfo: (filePath: string): Promise<VideoFile> => 
    ipcRenderer.invoke(IPC_CHANNELS.GET_VIDEO_INFO, filePath),
  
  // Hardware info
  getHardwareInfo: (): Promise<HardwareInfo> => 
    ipcRenderer.invoke(IPC_CHANNELS.GET_HARDWARE_INFO),
  
  // Conversion
  startConversion: (inputPath: string, outputPath: string, settings: ConversionSettings): Promise<string> => 
    ipcRenderer.invoke(IPC_CHANNELS.START_CONVERSION, inputPath, outputPath, settings),
  
  cancelConversion: (jobId: string): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.CANCEL_CONVERSION, jobId),
  
  // Progress listeners
  onConversionProgress: (callback: (progress: FFmpegProgress & { jobId: string }) => void) => {
    const listener = (_: any, progress: any) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.CONVERSION_PROGRESS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONVERSION_PROGRESS, listener);
  },
  
  onConversionComplete: (callback: (job: ConversionJob) => void) => {
    const listener = (_: any, job: any) => callback(job);
    ipcRenderer.on(IPC_CHANNELS.CONVERSION_COMPLETE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONVERSION_COMPLETE, listener);
  },
  
  onConversionError: (callback: (error: { jobId: string; message: string }) => void) => {
    const listener = (_: any, error: any) => callback(error);
    ipcRenderer.on(IPC_CHANNELS.CONVERSION_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONVERSION_ERROR, listener);
  },
  
  // Queue management
  getQueue: (): Promise<ConversionJob[]> => 
    ipcRenderer.invoke(IPC_CHANNELS.GET_QUEUE),
  
  removeFromQueue: (jobId: string): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.REMOVE_FROM_QUEUE, jobId),
  
  clearQueue: (): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.CLEAR_QUEUE),
  
  // Settings
  getSettings: (): Promise<any> => 
    ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  
  saveSettings: (settings: any): Promise<boolean> => 
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  
  // Thumbnail
  generateThumbnail: (filePath: string, timestamp: number): Promise<string> => 
    ipcRenderer.invoke(IPC_CHANNELS.GENERATE_THUMBNAIL, filePath, timestamp),
});

declare global {
  interface Window {
    electron: {
      selectInputFiles: () => Promise<string[]>;
      selectOutputFolder: () => Promise<string>;
      getVideoInfo: (filePath: string) => Promise<VideoFile>;
      getHardwareInfo: () => Promise<HardwareInfo>;
      startConversion: (inputPath: string, outputPath: string, settings: ConversionSettings) => Promise<string>;
      cancelConversion: (jobId: string) => Promise<boolean>;
      onConversionProgress: (callback: (progress: FFmpegProgress & { jobId: string }) => void) => () => void;
      onConversionComplete: (callback: (job: ConversionJob) => void) => () => void;
      onConversionError: (callback: (error: { jobId: string; message: string }) => void) => () => void;
      getQueue: () => Promise<ConversionJob[]>;
      removeFromQueue: (jobId: string) => Promise<boolean>;
      clearQueue: () => Promise<boolean>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      generateThumbnail: (filePath: string, timestamp: number) => Promise<string>;
    };
  }
}
