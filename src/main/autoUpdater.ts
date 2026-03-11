import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Configuration - Update these with your actual GitHub repository
const GITHUB_OWNER = 'your-github-username';
const GITHUB_REPO = 'video-converter';

// Check if updates are properly configured
const isUpdateConfigured = () => {
  return GITHUB_OWNER !== 'your-github-username' && GITHUB_REPO !== 'video-converter';
};

export class AutoUpdater {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    if (isUpdateConfigured()) {
      this.setupAutoUpdater();
    } else {
      log.info('Auto-updates not configured - skipping setup');
    }
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
      log.error('Update error:', error);
      this.mainWindow?.webContents.send('update-error', {
        message: error.message,
      });
    });
  }

  // Check for updates manually
  async checkForUpdates(): Promise<void> {
    try {
      log.info('Checking for updates...');
      
      // Check if updates are configured
      if (!isUpdateConfigured()) {
        log.info('Auto-updates not configured');
        this.mainWindow?.webContents.send('update-error', {
          message: 'Auto-updates not configured. Please update GITHUB_OWNER and GITHUB_REPO in autoUpdater.ts with your GitHub repository details.',
        });
        return;
      }
      
      // Skip in development
      if (process.env.NODE_ENV === 'development') {
        log.info('Skipping update check in development mode');
        this.mainWindow?.webContents.send('update-not-available');
        return;
      }
      
      await autoUpdater.checkForUpdates();
    } catch (error: any) {
      log.error('Error checking for updates:', error);
      
      // Handle 404 errors (repository not found or no releases)
      if (error.message?.includes('404')) {
        this.mainWindow?.webContents.send('update-error', {
          message: 'GitHub repository not found or has no releases. Please check your repository configuration in autoUpdater.ts',
        });
      } else if (error.message?.includes('ENOENT') || error.message?.includes('app-update.yml')) {
        this.mainWindow?.webContents.send('update-error', {
          message: 'Update checking not configured yet. Please set up GitHub releases in autoUpdater.ts',
        });
      } else {
        this.mainWindow?.webContents.send('update-error', {
          message: error.message || 'Failed to check for updates',
        });
      }
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
