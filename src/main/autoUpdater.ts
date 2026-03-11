import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Configuration - Update these with your actual GitHub repository
const GITHUB_OWNER = 'darrenkhouston';
const GITHUB_REPO = 'video-converter';

export class AutoUpdater {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  private setupAutoUpdater() {
    // Configure auto updater
    autoUpdater.autoDownload = false; // Don't auto-download, ask user first
    autoUpdater.autoInstallOnAppQuit = true;

    // Configure update feed URL for GitHub releases
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    // Update available
    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.mainWindow?.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });
    });

    // Update not available
    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
      this.mainWindow?.webContents.send('update-not-available');
    });

    // Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      log.info('Download progress:', progressObj.percent);
      this.mainWindow?.webContents.send('update-download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond,
      });
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.mainWindow?.webContents.send('update-downloaded', {
        version: info.version,
      });
    });

    // Error handling
    autoUpdater.on('error', (error) => {
      log.error('=== Update error event ===');
      log.error('Error:', error);
      log.error('Error message:', error.message);
      log.error('Error name:', error.name);
      log.error('Error stack:', error.stack);
      
      const errorMessage = error.message || '';
      const errorLower = errorMessage.toLowerCase();
      
      // Treat these cases as "up to date":
      // 1. No published versions found
      // 2. Cannot find/download update manifest files (.yml files)
      if (errorMessage.includes('No published versions on GitHub') ||
          errorLower.includes('latest-mac.yml') ||
          errorLower.includes('latest.yml') ||
          errorLower.includes('cannot download') && errorLower.includes('.yml')) {
        log.info('No installable updates available - treating as up to date');
        this.mainWindow?.webContents.send('update-not-available');
      } else {
        // Show user-friendly error message for actual errors (network, private repos, etc.)
        log.error('Showing error to user');
        this.mainWindow?.webContents.send('update-error', {
          message: 'Unable to check for updates',
        });
      }
    });
  }

  // Check for updates manually
  async checkForUpdates(): Promise<void> {
    try {
      log.info('=== Starting update check ===');
      log.info('Repository:', `${GITHUB_OWNER}/${GITHUB_REPO}`);
      log.info('Environment:', process.env.NODE_ENV);
      
      // Skip in development
      if (process.env.NODE_ENV === 'development') {
        log.info('Skipping update check in development mode');
        this.mainWindow?.webContents.send('update-not-available');
        return;
      }
      
      log.info('Calling autoUpdater.checkForUpdates()...');
      const result = await autoUpdater.checkForUpdates();
      log.info('Update check result:', result);
    } catch (error: any) {
      // Note: Most errors will be handled by the 'error' event listener
      // This catch block is mainly for setup/initialization errors
      log.error('=== Update check exception (non-event error) ===');
      log.error('Error:', error);
      log.error('Error message:', error.message);
      
      // Only handle local/initialization errors here
      // Update checking errors are handled by the error event listener
      const errorMessage = error.message || '';
      if (errorMessage.includes('ENOENT') || errorMessage.includes('app-update.yml')) {
        // Missing config file - treat as up to date
        log.info('Update configuration file not found - treating as up to date');
        this.mainWindow?.webContents.send('update-not-available');
      }
      // All other errors will be handled by the error event listener
    }
  }

  // Download update
  async downloadUpdate(): Promise<void> {
    try {
      log.info('Downloading update...');
      await autoUpdater.downloadUpdate();
    } catch (error: any) {
      log.error('Error downloading update:', error);
      this.mainWindow?.webContents.send('update-error', {
        message: error.message || 'Failed to download update',
      });
    }
  }

  // Install update and restart app
  quitAndInstall(): void {
    log.info('Installing update and restarting...');
    autoUpdater.quitAndInstall(false, true);
  }

  // Start periodic update checks (every 4 hours)
  startPeriodicChecks(intervalHours: number = 4): void {
    // Skip in development mode
    if (process.env.NODE_ENV === 'development') {
      log.info('Skipping periodic update checks in development mode');
      return;
    }

    // Check immediately on startup (after 10 seconds)
    setTimeout(() => {
      this.checkForUpdates();
    }, 10000);

    // Then check periodically
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    log.info(`Started periodic update checks every ${intervalHours} hours`);
  }

  // Stop periodic checks
  stopPeriodicChecks(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      log.info('Stopped periodic update checks');
    }
  }

  // Get current version
  getCurrentVersion(): string {
    return autoUpdater.currentVersion.version;
  }
}
