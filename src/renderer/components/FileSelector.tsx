import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  Delete,
  Add,
  VideoFile as VideoFileIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { VideoFile, ConversionJob, HardwareInfo, ConversionSettings } from '../../shared/types';
import ConversionSettingsDialog from './ConversionSettingsDialog';
import { PRESETS } from '../../shared/config';

interface FileSelectorProps {
  selectedFiles: VideoFile[];
  onFilesSelected: (files: VideoFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  onAddToQueue: (job: ConversionJob) => void;
  hardwareInfo: HardwareInfo | null;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  selectedFiles,
  onFilesSelected,
  onRemoveFile,
  onAddToQueue,
  hardwareInfo,
}) => {
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<VideoFile | null>(null);
  const [batchMode, setBatchMode] = useState(false);

  const handleSelectFiles = async () => {
    const filePaths = await window.electron.selectInputFiles();
    if (filePaths.length > 0) {
      const videoFiles = await Promise.all(
        filePaths.map((path) => window.electron.getVideoInfo(path))
      );
      onFilesSelected(videoFiles);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const videoFiles = await Promise.all(
      files.map((file) => window.electron.getVideoInfo(file.path))
    );
    onFilesSelected(videoFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleConvert = (file: VideoFile, settings: ConversionSettings) => {
    const job: ConversionJob = {
      id: Date.now().toString(),
      inputFile: file,
      outputPath: '', // Will be set by backend
      settings,
      status: 'queued',
      progress: 0,
    };
    onAddToQueue(job);
  };

  const handleBatchConvert = async (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset || selectedFiles.length === 0) return;

    const outputFolder = await window.electron.selectOutputFolder();
    if (!outputFolder) return;

    // Load default hardware acceleration setting
    const savedSettings = await window.electron.getSettings();
    const defaultHwAccel = savedSettings.defaultHardwareAccel || 'auto';

    for (const file of selectedFiles) {
      const settings: ConversionSettings = {
        mode: 'simple',
        outputFormat: preset.settings.outputFormat || 'mp4',
        videoCodec: preset.settings.videoCodec || 'h264',
        audioCodec: preset.settings.audioCodec || 'aac',
        audioMode: preset.settings.audioMode || 'convert',
        resolution: preset.settings.resolution,
        crf: preset.settings.crf,
        bitrate: preset.settings.bitrate,
        audioBitrate: preset.settings.audioBitrate,
        audioChannels: preset.settings.audioChannels,
        audioSampleRate: preset.settings.audioSampleRate,
        hardwareAcceleration: defaultHwAccel,
        preserveMetadata: preset.settings.preserveMetadata || true,
      };

      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const outputPath = `${outputFolder}/${fileName}.${settings.outputFormat}`;

      console.log('Starting batch conversion:', { inputPath: file.path, outputPath, settings });

      const jobId = await window.electron.startConversion(file.path, outputPath, settings);

      const job: ConversionJob = {
        id: jobId,
        inputFile: file,
        outputPath,
        settings,
        status: 'processing',
        progress: 0,
      };

      onAddToQueue(job);
    }
  };

  const handleBatchAdvancedConvert = () => {
    if (selectedFiles.length === 0) return;
    // Use the first file as reference for the dialog
    setCurrentFile(selectedFiles[0]);
    setBatchMode(true);
    setSettingsDialogOpen(true);
  };

  const handleQuickConvert = async (file: VideoFile, presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const outputFolder = await window.electron.selectOutputFolder();
    if (!outputFolder) return;

    // Load default hardware acceleration setting
    const savedSettings = await window.electron.getSettings();
    const defaultHwAccel = savedSettings.defaultHardwareAccel || 'auto';

    const settings: ConversionSettings = {
      mode: 'simple',
      outputFormat: preset.settings.outputFormat || 'mp4',
      videoCodec: preset.settings.videoCodec || 'h264',
      audioCodec: preset.settings.audioCodec || 'aac',
      audioMode: preset.settings.audioMode || 'convert',
      resolution: preset.settings.resolution,
      crf: preset.settings.crf,
      bitrate: preset.settings.bitrate,
      audioBitrate: preset.settings.audioBitrate,
      audioChannels: preset.settings.audioChannels,
      audioSampleRate: preset.settings.audioSampleRate,
      hardwareAcceleration: defaultHwAccel,
      preserveMetadata: preset.settings.preserveMetadata || true,
    };

    // Use path.join equivalent - construct proper path for Windows/Mac/Linux
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const outputPath = `${outputFolder}/${fileName}.${settings.outputFormat}`;

    console.log('Starting conversion:', { inputPath: file.path, outputPath, settings });

    const jobId = await window.electron.startConversion(file.path, outputPath, settings);

    const job: ConversionJob = {
      id: jobId,
      inputFile: file,
      outputPath,
      settings,
      status: 'processing',
      progress: 0,
    };

    onAddToQueue(job);
  };

  const handleAdvancedConvert = (file: VideoFile) => {
    setCurrentFile(file);
    setBatchMode(false);
    setSettingsDialogOpen(true);
  };

  const handleSettingsConfirm = async (settings: ConversionSettings) => {
    if (!currentFile) return;

    const outputFolder = await window.electron.selectOutputFolder();
    if (!outputFolder) return;

    // If batch mode, apply settings to all files
    const filesToConvert = batchMode ? selectedFiles : [currentFile];

    for (const file of filesToConvert) {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const outputPath = `${outputFolder}/${fileName}.${settings.outputFormat}`;

      console.log('Starting conversion:', { inputPath: file.path, outputPath, settings });

      const jobId = await window.electron.startConversion(file.path, outputPath, settings);

      const job: ConversionJob = {
        id: jobId,
        inputFile: file,
        outputPath,
        settings,
        status: 'processing',
        progress: 0,
      };

      onAddToQueue(job);
    }

    setSettingsDialogOpen(false);
    setCurrentFile(null);
    setBatchMode(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'primary.main',
          bgcolor: 'background.default',
          cursor: 'pointer',
        }}
        onClick={handleSelectFiles}
      >
        <VideoFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drop video files here or click to browse
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports: MP4, MKV, AVI, MOV, WebM, and more
        </Typography>
      </Paper>

      {selectedFiles.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Selected Files ({selectedFiles.length})
            </Typography>
            {selectedFiles.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ alignSelf: 'center', mr: 1 }}>
                  Batch Convert All:
                </Typography>
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    size="small"
                    variant="contained"
                    onClick={() => handleBatchConvert(preset.id)}
                  >
                    {preset.name}
                  </Button>
                ))}
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<SettingsIcon />}
                  onClick={() => handleBatchAdvancedConvert()}
                >
                  Advanced
                </Button>
              </Box>
            )}
          </Box>
          <Grid container spacing={2}>
            {selectedFiles.map((file) => (
              <Grid item xs={12} md={6} key={file.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '70%' }}>
                        <Typography variant="subtitle1" noWrap>
                          {file.name}
                        </Typography>
                        {file.isHDR && (
                          <Chip
                            label="HDR"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                      <IconButton size="small" onClick={() => onRemoveFile(file.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {file.width}x{file.height} • {file.codec.toUpperCase()} • {file.fps.toFixed(2)} fps
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatSize(file.size)} • {formatDuration(file.duration)}
                    </Typography>
                    {file.audioTracks && file.audioTracks.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Audio: {file.audioTracks.length} track(s)
                      </Typography>
                    )}
                    {file.subtitles && file.subtitles.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Subtitles: {file.subtitles.length} track(s)
                      </Typography>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
                    <Typography variant="caption" sx={{ width: '100%', mb: 1 }}>
                      Quick Convert:
                    </Typography>
                    {PRESETS.map((preset) => (
                      <Button
                        key={preset.id}
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickConvert(file, preset.id)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleAdvancedConvert(file)}
                      sx={{ ml: 'auto' }}
                    >
                      Advanced
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {currentFile && (
        <ConversionSettingsDialog
          open={settingsDialogOpen}
          videoFile={currentFile}
          hardwareInfo={hardwareInfo}
          onClose={() => {
            setSettingsDialogOpen(false);
            setCurrentFile(null);
            setBatchMode(false);
          }}
          onConfirm={handleSettingsConfirm}
        />
      )}
    </Box>
  );
};

export default FileSelector;
