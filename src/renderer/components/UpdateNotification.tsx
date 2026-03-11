import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  Download,
  Update,
  Close,
  CheckCircle,
} from '@mui/icons-material';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [readyVersion, setReadyVersion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Set up update event listeners
    const unsubAvailable = window.electron.onUpdateAvailable((info) => {
      console.log('Update available:', info);
      setUpdateInfo(info);
      setUpdateAvailable(true);
      setChecking(false);
    });

    const unsubNotAvailable = window.electron.onUpdateNotAvailable(() => {
      console.log('No updates available');
      setChecking(false);
    });

    const unsubDownloadProgress = window.electron.onUpdateDownloadProgress((progress) => {
      console.log('Download progress:', progress.percent);
      setDownloadProgress(progress);
    });

    const unsubDownloaded = window.electron.onUpdateDownloaded((info) => {
      console.log('Update downloaded:', info);
      setDownloading(false);
      setUpdateReady(true);
      setReadyVersion(info.version);
      setUpdateAvailable(false);
    });

    const unsubError = window.electron.onUpdateError((err) => {
      console.error('Update error:', err);
      setError(err.message);
      setShowErrorSnackbar(true);
      setDownloading(false);
      setChecking(false);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubAvailable();
      unsubNotAvailable();
      unsubDownloadProgress();
      unsubDownloaded();
      unsubError();
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    setError(null);
    await window.electron.checkForUpdates();
  };

  const handleDownloadUpdate = async () => {
    setDownloading(true);
    setError(null);
    await window.electron.downloadUpdate();
  };

  const handleInstallUpdate = async () => {
    await window.electron.installUpdate();
  };

  const handleCloseUpdateDialog = () => {
    setUpdateAvailable(false);
    setUpdateInfo(null);
  };

  const handleCloseReadyDialog = () => {
    setUpdateReady(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  return (
    <>
      {/* Update Available Dialog */}
      <Dialog open={updateAvailable} onClose={handleCloseUpdateDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Download sx={{ mr: 1 }} />
            Update Available
          </Box>
        </DialogTitle>
        <DialogContent>
          {updateInfo && (
            <Box>
              <Typography variant="body1" gutterBottom>
                A new version <strong>{updateInfo.version}</strong> is available!
              </Typography>
              {updateInfo.releaseDate && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Released: {new Date(updateInfo.releaseDate).toLocaleDateString()}
                </Typography>
              )}
              {updateInfo.releaseNotes && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    What's New:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {updateInfo.releaseNotes}
                  </Typography>
                </Box>
              )}
              {downloading && downloadProgress && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Downloading update... {Math.round(downloadProgress.percent)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={downloadProgress.percent} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)}
                    {' '}({formatSpeed(downloadProgress.bytesPerSecond)})
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog} disabled={downloading}>
            Later
          </Button>
          <Button
            variant="contained"
            onClick={handleDownloadUpdate}
            disabled={downloading}
            startIcon={<Download />}
          >
            {downloading ? 'Downloading...' : 'Download Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Ready Dialog */}
      <Dialog open={updateReady} onClose={handleCloseReadyDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            Update Ready
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Version {readyVersion} has been downloaded and is ready to install.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The application will restart to complete the installation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReadyDialog}>
            Install Later
          </Button>
          <Button
            variant="contained"
            onClick={handleInstallUpdate}
            startIcon={<Update />}
          >
            Restart & Install
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setShowErrorSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error || 'Update error occurred'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateNotification;
