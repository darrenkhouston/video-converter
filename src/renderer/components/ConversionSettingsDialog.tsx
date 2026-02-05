import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Box,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import type { VideoFile, ConversionSettings, HardwareInfo } from '../../shared/types';
import { VIDEO_CODECS, AUDIO_CODECS, SUPPORTED_FORMATS } from '../../shared/config';

interface ConversionSettingsDialogProps {
  open: boolean;
  videoFile: VideoFile;
  hardwareInfo: HardwareInfo | null;
  onClose: () => void;
  onConfirm: (settings: ConversionSettings) => void;
}

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
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const ConversionSettingsDialog: React.FC<ConversionSettingsDialogProps> = ({
  open,
  videoFile,
  hardwareInfo,
  onClose,
  onConfirm,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    mode: 'advanced',
    outputFormat: 'mp4',
    videoCodec: 'h264',
    audioCodec: 'aac',
    audioMode: 'convert',
    hdrToneMapping: false,
    resolution: {
      width: videoFile.width,
      height: videoFile.height,
    },
    crf: 23,
    fps: videoFile.fps,
    audioChannels: videoFile.audioChannels || 2,
    audioSampleRate: videoFile.audioSampleRate || 48000,
    audioBitrate: '192k',
    hardwareAcceleration: 'auto',
    preserveMetadata: true,
  });

  const handleChange = (field: keyof ConversionSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleResolutionChange = (field: 'width' | 'height', value: number) => {
    setSettings((prev) => ({
      ...prev,
      resolution: {
        ...prev.resolution!,
        [field]: value,
      },
    }));
  };

  const handlePresetResolution = (width: number, height: number) => {
    setSettings((prev) => ({
      ...prev,
      resolution: { width, height },
    }));
  };

  const handleConfirm = () => {
    onConfirm(settings);
    onClose();
  };

  const commonResolutions = [
    { name: '4K UHD', width: 3840, height: 2160 },
    { name: '1080p', width: 1920, height: 1080 },
    { name: '720p', width: 1280, height: 720 },
    { name: '480p', width: 854, height: 480 },
    { name: 'Original', width: videoFile.width, height: videoFile.height },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Advanced Conversion Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          File: {videoFile.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
          Current: {videoFile.width}x{videoFile.height} • {videoFile.codec.toUpperCase()} • {videoFile.fps.toFixed(2)} fps
        </Typography>

        <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
          <Tab label="Video" />
          <Tab label="Audio" />
          <Tab label="Advanced" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Output Format</InputLabel>
                <Select
                  value={settings.outputFormat}
                  label="Output Format"
                  onChange={(e) => handleChange('outputFormat', e.target.value)}
                >
                  {SUPPORTED_FORMATS.output.map((format) => (
                    <MenuItem key={format} value={format}>
                      {format.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Video Codec</InputLabel>
                <Select
                  value={settings.videoCodec}
                  label="Video Codec"
                  onChange={(e) => handleChange('videoCodec', e.target.value)}
                >
                  {VIDEO_CODECS.map((codec) => (
                    <MenuItem key={codec} value={codec}>
                      {codec === 'hevc' ? 'H.265 (HEVC)' : codec === 'h264' ? 'H.264' : codec.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Resolution
              </Typography>
              <Grid container spacing={2}>
                {commonResolutions.map((res) => (
                  <Grid item key={res.name}>
                    <Button
                      variant={
                        settings.resolution?.width === res.width &&
                          settings.resolution?.height === res.height
                          ? 'contained'
                          : 'outlined'
                      }
                      size="small"
                      onClick={() => handlePresetResolution(res.width, res.height)}
                    >
                      {res.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Width"
                type="number"
                value={settings.resolution?.width || videoFile.width}
                onChange={(e) => handleResolutionChange('width', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Height"
                type="number"
                value={settings.resolution?.height || videoFile.height}
                onChange={(e) => handleResolutionChange('height', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Quality (CRF: {settings.crf}) - Lower is better quality
              </Typography>
              <Slider
                value={settings.crf || 23}
                onChange={(_, value) => handleChange('crf', value)}
                min={0}
                max={51}
                marks={[
                  { value: 18, label: 'High' },
                  { value: 23, label: 'Medium' },
                  { value: 28, label: 'Low' },
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Frame Rate (FPS)"
                type="number"
                value={settings.fps || videoFile.fps}
                onChange={(e) => handleChange('fps', parseFloat(e.target.value))}
                helperText="Leave as original or set custom FPS"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Hardware Acceleration</InputLabel>
                <Select
                  value={settings.hardwareAcceleration}
                  label="Hardware Acceleration"
                  onChange={(e) => handleChange('hardwareAcceleration', e.target.value)}
                >
                  <MenuItem value="auto">Auto Detect</MenuItem>
                  <MenuItem value="nvenc" disabled={!hardwareInfo?.availableEncoders.nvenc}>
                    NVIDIA NVENC {!hardwareInfo?.availableEncoders.nvenc && '(Not Available)'}
                  </MenuItem>
                  <MenuItem value="qsv" disabled={!hardwareInfo?.availableEncoders.qsv}>
                    Intel QuickSync {!hardwareInfo?.availableEncoders.qsv && '(Not Available)'}
                  </MenuItem>
                  <MenuItem value="amf" disabled={!hardwareInfo?.availableEncoders.amf}>
                    AMD AMF {!hardwareInfo?.availableEncoders.amf && '(Not Available)'}
                  </MenuItem>
                  <MenuItem value="none">CPU Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.hdrToneMapping || false}
                    onChange={(e) => handleChange('hdrToneMapping', e.target.checked)}
                  />
                }
                label="Enable HDR to SDR Tone Mapping"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                ⚠️ Warning: Tone mapping is very slow but fixes washed out colors in HDR content. Leave disabled for faster conversion.
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Audio Processing Mode</InputLabel>
                <Select
                  value={settings.audioMode || 'convert'}
                  label="Audio Processing Mode"
                  onChange={(e) => handleChange('audioMode', e.target.value)}
                >
                  <MenuItem value="convert">Convert (Stereo 2.0) - Recommended</MenuItem>
                  <MenuItem value="copy">Copy (Passthrough) - Keep original</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {settings.audioMode === 'copy'
                    ? 'Original audio will be copied without re-encoding. All audio settings below will be ignored.'
                    : 'Audio will be re-encoded to stereo for maximum compatibility.'}
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={settings.audioMode === 'copy'}>
                <InputLabel>Audio Codec</InputLabel>
                <Select
                  value={settings.audioCodec}
                  label="Audio Codec"
                  onChange={(e) => handleChange('audioCodec', e.target.value)}
                >
                  {AUDIO_CODECS.map((codec) => (
                    <MenuItem key={codec} value={codec}>
                      {codec.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled={settings.audioMode === 'copy'}
                label="Audio Bitrate"
                value={settings.audioBitrate}
                onChange={(e) => handleChange('audioBitrate', e.target.value)}
                helperText="e.g., 128k, 192k, 320k"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled={settings.audioMode === 'copy'}
                label="Audio Channels"
                type="number"
                value={settings.audioChannels || 2}
                onChange={(e) => handleChange('audioChannels', parseInt(e.target.value))}
                helperText="2 = Stereo, 6 = 5.1 Surround"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled={settings.audioMode === 'copy'}
                label="Sample Rate (Hz)"
                type="number"
                value={settings.audioSampleRate || 48000}
                onChange={(e) => handleChange('audioSampleRate', parseInt(e.target.value))}
              />
            </Grid>

            {videoFile.audioTracks && videoFile.audioTracks.length > 1 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Audio Track</InputLabel>
                  <Select
                    value={settings.selectedAudioTrack ?? 0}
                    label="Select Audio Track"
                    onChange={(e) => handleChange('selectedAudioTrack', e.target.value)}
                  >
                    {videoFile.audioTracks.map((track, index) => (
                      <MenuItem key={index} value={index}>
                        Track {index + 1}: {track.codec} - {track.channels} channels {track.language && `(${track.language})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trim Start (seconds)"
                type="number"
                value={settings.trimStart || ''}
                onChange={(e) => handleChange('trimStart', parseFloat(e.target.value) || undefined)}
                helperText="Start time for trimmed video"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trim End (seconds)"
                type="number"
                value={settings.trimEnd || ''}
                onChange={(e) => handleChange('trimEnd', parseFloat(e.target.value) || undefined)}
                helperText="End time for trimmed video"
              />
            </Grid>

            {videoFile.subtitles && videoFile.subtitles.length > 0 && (
              <>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.embedSubtitles || false}
                        onChange={(e) => handleChange('embedSubtitles', e.target.checked)}
                      />
                    }
                    label="Embed Subtitles"
                  />
                </Grid>

                {settings.embedSubtitles && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Subtitle Track</InputLabel>
                      <Select
                        value={settings.selectedSubtitleTrack ?? 0}
                        label="Select Subtitle Track"
                        onChange={(e) => handleChange('selectedSubtitleTrack', e.target.value)}
                      >
                        {videoFile.subtitles.map((track, index) => (
                          <MenuItem key={index} value={index}>
                            Track {index + 1}: {track.codec} {track.language && `(${track.language})`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.preserveMetadata}
                    onChange={(e) => handleChange('preserveMetadata', e.target.checked)}
                  />
                }
                label="Preserve Metadata (Title, Artist, etc.)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Video Bitrate (optional)"
                value={settings.bitrate || ''}
                onChange={(e) => handleChange('bitrate', e.target.value)}
                helperText="e.g., 2000k, 5M - Leave empty to use CRF"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Start Conversion
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversionSettingsDialog;
