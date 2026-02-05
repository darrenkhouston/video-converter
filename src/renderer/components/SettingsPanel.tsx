import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import type { HardwareInfo } from '../../shared/types';

interface SettingsPanelProps {
  hardwareInfo: HardwareInfo | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ hardwareInfo }) => {
  const [defaultHardwareAccel, setDefaultHardwareAccel] = React.useState<string>('auto');
  const [autoStart, setAutoStart] = React.useState<boolean>(false);
  const [preserveMetadata, setPreserveMetadata] = React.useState<boolean>(true);

  // Load settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electron.getSettings();
      if (settings.defaultHardwareAccel) {
        setDefaultHardwareAccel(settings.defaultHardwareAccel);
      }
      if (settings.autoStart !== undefined) {
        setAutoStart(settings.autoStart);
      }
      if (settings.preserveMetadata !== undefined) {
        setPreserveMetadata(settings.preserveMetadata);
      }
    };
    loadSettings();
  }, []);

  // Save hardware acceleration setting
  const handleHardwareAccelChange = async (value: string) => {
    setDefaultHardwareAccel(value);
    const settings = await window.electron.getSettings();
    await window.electron.saveSettings({ ...settings, defaultHardwareAccel: value });
  };

  // Save auto-start setting
  const handleAutoStartChange = async (checked: boolean) => {
    setAutoStart(checked);
    const settings = await window.electron.getSettings();
    await window.electron.saveSettings({ ...settings, autoStart: checked });
  };

  // Save preserve metadata setting
  const handlePreserveMetadataChange = async (checked: boolean) => {
    setPreserveMetadata(checked);
    const settings = await window.electron.getSettings();
    await window.electron.saveSettings({ ...settings, preserveMetadata: checked });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Application Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Default Conversion Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Default Hardware Acceleration</InputLabel>
              <Select
                value={defaultHardwareAccel}
                label="Default Hardware Acceleration"
                onChange={(e) => handleHardwareAccelChange(e.target.value)}
              >
                <MenuItem value="auto">Auto Detect (Recommended)</MenuItem>
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

            <FormControlLabel
              control={
                <Switch
                  checked={preserveMetadata}
                  onChange={(e) => handlePreserveMetadataChange(e.target.checked)}
                />
              }
              label="Preserve metadata by default"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Behavior
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={autoStart}
                  onChange={(e) => handleAutoStartChange(e.target.checked)}
                />
              }
              label="Auto-start conversions when added to queue"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Hardware Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {hardwareInfo ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Available Hardware Encoders:
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {hardwareInfo.availableEncoders.nvenc ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="disabled" fontSize="small" />
                      )}
                      <Typography variant="body2">NVIDIA NVENC</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {hardwareInfo.availableEncoders.qsv ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="disabled" fontSize="small" />
                      )}
                      <Typography variant="body2">Intel QuickSync</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {hardwareInfo.availableEncoders.amf ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="disabled" fontSize="small" />
                      )}
                      <Typography variant="body2">AMD AMF</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Note:</strong> Hardware acceleration significantly speeds up video
                      conversion and reduces CPU usage. The application will automatically use the
                      best available encoder.
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading hardware information...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                About
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Video Converter</strong> v1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                A professional video conversion tool with support for multiple formats, GPU
                acceleration, and advanced features like trimming, subtitle embedding, and batch
                processing.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by FFmpeg • Built with Electron & React
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPanel;
