/// <reference types="vite/client" />

declare global {
  interface Window {
    electron: {
      selectInputFiles: () => Promise<string[]>;
      selectOutputFolder: () => Promise<string>;
      getVideoInfo: (filePath: string) => Promise<import('../shared/types').VideoFile>;
      getHardwareInfo: () => Promise<import('../shared/types').HardwareInfo>;
      startConversion: (inputPath: string, outputPath: string, settings: import('../shared/types').ConversionSettings) => Promise<string>;
      cancelConversion: (jobId: string) => Promise<boolean>;
      onConversionProgress: (callback: (progress: import('../shared/types').FFmpegProgress & { jobId: string }) => void) => () => void;
      onConversionComplete: (callback: (job: import('../shared/types').ConversionJob) => void) => () => void;
      onConversionError: (callback: (error: { jobId: string; message: string }) => void) => () => void;
      getQueue: () => Promise<import('../shared/types').ConversionJob[]>;
      removeFromQueue: (jobId: string) => Promise<boolean>;
      clearQueue: () => Promise<boolean>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      generateThumbnail: (filePath: string, timestamp: number) => Promise<string>;
    };
  }
}

export {};
