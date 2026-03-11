import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import { VideoLibrary } from '@mui/icons-material';
import FileSelector from './components/FileSelector';
import ConversionQueue from './components/ConversionQueue';
import SettingsPanel from './components/SettingsPanel';
import ConversionHistory from './components/ConversionHistory';
import UpdateNotification from './components/UpdateNotification';
import type { VideoFile, ConversionJob, HardwareInfo, ConversionHistory as ConversionHistoryType } from '../shared/types';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [selectedFiles, setSelectedFiles] = useState<VideoFile[]>([]);
  const [conversionQueue, setConversionQueue] = useState<ConversionJob[]>([]);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [history, setHistory] = useState<ConversionHistoryType[]>([]);

  useEffect(() => {
    // Load hardware info
    window.electron.getHardwareInfo().then(setHardwareInfo);

    // Setup progress listeners
    const unsubProgress = window.electron.onConversionProgress((progress) => {
      setConversionQueue((queue) =>
        queue.map((job) =>
          job.id === progress.jobId
            ? { ...job, progress: progress.percent, status: 'processing' as const }
            : job
        )
      );
    });

    const unsubComplete = window.electron.onConversionComplete((completedJob) => {
      // Add to history
      if (completedJob.startTime && completedJob.outputSize) {
        const historyItem: ConversionHistoryType = {
          id: `history-${completedJob.id}-${Date.now()}`,
          timestamp: Date.now(),
          originalFile: {
            name: completedJob.inputFile.name,
            path: completedJob.inputFile.path,
            size: completedJob.inputFile.size,
            format: completedJob.inputFile.format,
            codec: completedJob.inputFile.codec,
            resolution: `${completedJob.inputFile.width}x${completedJob.inputFile.height}`,
            duration: completedJob.inputFile.duration,
          },
          convertedFile: {
            path: completedJob.outputPath,
            size: completedJob.outputSize,
            format: completedJob.settings.outputFormat,
            codec: completedJob.settings.videoCodec,
            resolution: completedJob.settings.resolution
              ? `${completedJob.settings.resolution.width}x${completedJob.settings.resolution.height}`
              : `${completedJob.inputFile.width}x${completedJob.inputFile.height}`,
          },
          settings: completedJob.settings,
          duration: Date.now() - completedJob.startTime,
        };

        setHistory((prev) => [historyItem, ...prev]);

        // Remove from selected files by matching file path
        setSelectedFiles((files) =>
          files.filter((f) => f.path !== completedJob.inputFile.path)
        );
      }

      // Update queue status
      setConversionQueue((queue) =>
        queue.map((job) =>
          job.id === completedJob.id ? { ...job, progress: 100, status: 'completed' as const, outputSize: completedJob.outputSize, endTime: completedJob.endTime } : job
        )
      );
    });

    const unsubError = window.electron.onConversionError((error) => {
      setConversionQueue((queue) =>
        queue.map((job) =>
          job.id === error.jobId
            ? { ...job, status: 'failed' as const, error: error.message }
            : job
        )
      );
    });

    // Cleanup function to remove all listeners
    return () => {
      unsubProgress();
      unsubComplete();
      unsubError();
    };
  }, []);

  const handleFilesSelected = (files: VideoFile[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setCurrentTab(0);
  };

  const handleAddToQueue = (job: ConversionJob) => {
    setConversionQueue((prev) => [...prev, job]);
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleRemoveFromQueue = async (jobId: string) => {
    await window.electron.removeFromQueue(jobId);
    setConversionQueue((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handleClearQueue = async () => {
    await window.electron.clearQueue();
    setConversionQueue([]);
  };

  const handleCancelConversion = async (jobId: string) => {
    await window.electron.cancelConversion(jobId);
    setConversionQueue((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'cancelled' as const } : job
      )
    );
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <VideoLibrary sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Video Converter
            </Typography>
            {hardwareInfo && (
              <Typography variant="body2">
                GPU: {hardwareInfo.availableEncoders.nvenc && 'NVENC '}
                {hardwareInfo.availableEncoders.qsv && 'QuickSync '}
                {hardwareInfo.availableEncoders.amf && 'AMF '}
                {!hardwareInfo.availableEncoders.nvenc &&
                  !hardwareInfo.availableEncoders.qsv &&
                  !hardwareInfo.availableEncoders.amf &&
                  'CPU Only'}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Files & Conversion" />
            <Tab label="Queue" />
            <Tab label="History" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={currentTab} index={0}>
            <FileSelector
              selectedFiles={selectedFiles}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={handleRemoveFile}
              onAddToQueue={handleAddToQueue}
              hardwareInfo={hardwareInfo}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <ConversionQueue
              queue={conversionQueue}
              onRemoveFromQueue={handleRemoveFromQueue}
              onClearQueue={handleClearQueue}
              onCancelConversion={handleCancelConversion}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <ConversionHistory
              history={history}
              onClearHistory={handleClearHistory}
              onRemoveHistoryItem={handleRemoveHistoryItem}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <SettingsPanel hardwareInfo={hardwareInfo} />
          </TabPanel>
        </Box>
      </Box>
      <UpdateNotification />
    </ThemeProvider>
  );
}

export default App;
