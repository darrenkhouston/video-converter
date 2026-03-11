import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { VideoProcessor } from './videoProcessor';
import { IPC_CHANNELS } from '../shared/config';
import Store from 'electron-store';
import type { ConversionSettings } from '../shared/types';

const store = new Store();
const videoProcessor = new VideoProcessor();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  const htmlPath = path.join(__dirname, '../../renderer/index.html');
  const iconPath = path.join(__dirname, '../../assets/icons/512x512.png');
  
  console.log('Preload path:', preloadPath);
  console.log('HTML path:', htmlPath);
  console.log('Preload exists:', require('fs').existsSync(preloadPath));
  console.log('HTML exists:', require('fs').existsSync(htmlPath));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow?.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading file:', htmlPath);
    mainWindow.loadFile(htmlPath)
      .then(() => console.log('File loaded successfully'))
      .catch((err) => {
        console.error('Failed to load index.html:', err);
        console.error('Tried to load from:', htmlPath);
      });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log any errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]:`, message);
  });
}

app.whenReady().then(() => {
  console.log('App is ready');
  console.log('__dirname:', __dirname);
  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  // File selection
  ipcMain.handle(IPC_CHANNELS.SELECT_INPUT_FILES, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v', 'flv', 'wmv', 'mpg', 'mpeg', '3gp'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    return result.filePaths;
  });

  ipcMain.handle(IPC_CHANNELS.SELECT_OUTPUT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result.filePaths[0];
  });

  // Video info
  ipcMain.handle(IPC_CHANNELS.GET_VIDEO_INFO, async (_, filePath: string) => {
    return await videoProcessor.getVideoInfo(filePath);
  });

  // Hardware info
  ipcMain.handle(IPC_CHANNELS.GET_HARDWARE_INFO, async () => {
    return await videoProcessor.getHardwareInfo();
  });

  // Conversion
  ipcMain.handle(
    IPC_CHANNELS.START_CONVERSION,
    async (_, inputPath: string, outputPath: string, settings: ConversionSettings) => {
      const jobId = await videoProcessor.startConversion(
        inputPath,
        outputPath,
        settings,
        (progress) => {
          mainWindow?.webContents.send(IPC_CHANNELS.CONVERSION_PROGRESS, progress);
        },
        (error) => {
          mainWindow?.webContents.send(IPC_CHANNELS.CONVERSION_ERROR, error);
        },
        (completedJob) => {
          mainWindow?.webContents.send(IPC_CHANNELS.CONVERSION_COMPLETE, completedJob);
        }
      );
      return jobId;
    }
  );

  ipcMain.handle(IPC_CHANNELS.CANCEL_CONVERSION, async (_, jobId: string) => {
    return await videoProcessor.cancelConversion(jobId);
  });

  // Queue management
  ipcMain.handle(IPC_CHANNELS.GET_QUEUE, async () => {
    return videoProcessor.getQueue();
  });

  ipcMain.handle(IPC_CHANNELS.REMOVE_FROM_QUEUE, async (_, jobId: string) => {
    return videoProcessor.removeFromQueue(jobId);
  });

  ipcMain.handle(IPC_CHANNELS.CLEAR_QUEUE, async () => {
    return videoProcessor.clearQueue();
  });

  // Settings
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
    return store.get('settings', {});
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, async (_, settings: any) => {
    store.set('settings', settings);
    return true;
  });

  // Thumbnail generation
  ipcMain.handle(IPC_CHANNELS.GENERATE_THUMBNAIL, async (_, filePath: string, timestamp: number) => {
    return await videoProcessor.generateThumbnail(filePath, timestamp);
  });
}
