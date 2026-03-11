import { app, BrowserWindow, ipcMain, dialog, Menu, shell, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { VideoProcessor } from './videoProcessor';
import { AutoUpdater } from './autoUpdater';
import { IPC_CHANNELS } from '../shared/config';
import Store from 'electron-store';
import type { ConversionSettings } from '../shared/types';

const store = new Store();
const videoProcessor = new VideoProcessor();

let mainWindow: BrowserWindow | null = null;
let updater: AutoUpdater | null = null;

// Helper function to get content type based on file extension
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.ogv': 'video/ogg',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.m4v': 'video/mp4',
    '.3gp': 'video/3gpp',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
  };
  return contentTypes[ext] || 'video/mp4';
}

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

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  
  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    // File menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' as const },
          { role: 'delete' as const },
          { role: 'selectAll' as const }
        ] : [
          { role: 'delete' as const },
          { type: 'separator' as const },
          { role: 'selectAll' as const }
        ])
      ]
    },
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const }
      ]
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac ? [
          { type: 'separator' as const },
          { role: 'front' as const },
          { type: 'separator' as const },
          { role: 'window' as const }
        ] : [
          { role: 'close' as const }
        ])
      ]
    },
    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates...',
          click: async () => {
            if (updater) {
              await updater.checkForUpdates();
            }
          }
        },
        { type: 'separator' as const },
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/your-github-username/video-converter')
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Register custom protocol for serving video files
// This must be done before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'video-file',
    privileges: {
      bypassCSP: true,
      stream: true,
      supportFetchAPI: true,
      standard: true,
      secure: true,
    },
  },
]);

app.whenReady().then(() => {
  console.log('App is ready');
  console.log('__dirname:', __dirname);

  // Register the custom protocol handler for video streaming
  protocol.registerStreamProtocol('video-file', (request, callback) => {
    // Extract the file path from the URL (e.g., video-file:///Users/path/to/video.mp4)
    // Remove the protocol prefix and decode the path
    let filePath = request.url.replace('video-file://', '');
    
    // Ensure path starts with / (absolute path)
    if (!filePath.startsWith('/')) {
      filePath = '/' + filePath;
    }
    
    filePath = decodeURIComponent(filePath);
    
    console.log('Serving video file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      callback({ statusCode: 404 });
      return;
    }
    
    try {
      // Get file stats
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const contentType = getContentType(filePath);
      
      // Parse range header if present (for seeking in video)
      const rangeHeader = request.headers.Range || request.headers.range;
      
      if (rangeHeader) {
        // Handle range requests for video seeking
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        
        const stream = fs.createReadStream(filePath, { start, end });
        
        callback({
          statusCode: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': contentType,
          },
          data: stream,
        });
      } else {
        // Return full file
        const stream = fs.createReadStream(filePath);
        
        callback({
          statusCode: 200,
          headers: {
            'Content-Length': fileSize.toString(),
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
          },
          data: stream,
        });
      }
    } catch (error) {
      console.error('Error serving video:', error);
      callback({ statusCode: 500 });
    }
  });

  createWindow();
  setupIpcHandlers();
  
  // Initialize auto-updater
  // Temporarily enabled in development for testing
  if (mainWindow) {
    updater = new AutoUpdater(mainWindow);
    // Only start periodic checks in production
    if (process.env.NODE_ENV !== 'development') {
      updater.startPeriodicChecks(4); // Check every 4 hours
    }
  }

  // Set up application menu
  createApplicationMenu();

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

  ipcMain.handle(IPC_CHANNELS.GENERATE_THUMBNAILS, async (_, filePath: string, timestamps: number[]) => {
    return await videoProcessor.generateThumbnails(filePath, timestamps);
  });

  // Auto-update handlers
  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, async () => {
    if (updater) {
      await updater.checkForUpdates();
      return true;
    }
    return false;
  });

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_UPDATE, async () => {
    if (updater) {
      await updater.downloadUpdate();
      return true;
    }
    return false;
  });

  ipcMain.handle(IPC_CHANNELS.INSTALL_UPDATE, async () => {
    if (updater) {
      updater.quitAndInstall();
      return true;
    }
    return false;
  });

  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, async () => {
    return app.getVersion();
  });
}
