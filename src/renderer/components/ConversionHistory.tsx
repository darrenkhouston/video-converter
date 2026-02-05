import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import { Delete, CheckCircle } from '@mui/icons-material';
import type { ConversionHistory } from '../../shared/types';

interface ConversionHistoryProps {
  history: ConversionHistory[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

const ConversionHistory: React.FC<ConversionHistoryProps> = ({
  history,
  onClearHistory,
  onRemoveHistoryItem,
}) => {
  if (history.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No conversion history yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Completed conversions will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Conversion History ({history.length})</Typography>
        <Chip
          label="Clear History"
          color="error"
          variant="outlined"
          onClick={onClearHistory}
          size="small"
        />
      </Box>

      <List sx={{ width: '100%' }}>
        {history.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              mb: 2,
              p: 0,
              display: 'block',
            }}
          >
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {item.originalFile.name}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {formatTimestamp(item.timestamp)}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Original:</strong>
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2">
                          Format: {item.originalFile.format.toUpperCase()} ({item.originalFile.codec})
                        </Typography>
                        <Typography variant="body2">
                          Resolution: {item.originalFile.resolution}
                        </Typography>
                        <Typography variant="body2">
                          Size: {formatBytes(item.originalFile.size)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Converted to:</strong>
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2">
                          Format: {item.convertedFile.format.toUpperCase()} ({item.convertedFile.codec})
                        </Typography>
                        <Typography variant="body2">
                          Resolution: {item.convertedFile.resolution}
                        </Typography>
                        <Typography variant="body2">
                          Size: {formatBytes(item.convertedFile.size)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Conversion Time: ${formatDuration(item.duration)}`}
                      size="small"
                      variant="outlined"
                    />
                    {item.settings.hardwareAcceleration !== 'none' && item.settings.hardwareAcceleration !== 'auto' && (
                      <Chip
                        label={`GPU: ${item.settings.hardwareAcceleration.toUpperCase()}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {item.originalFile.size > item.convertedFile.size && (
                      <Chip
                        label={`Saved ${formatBytes(item.originalFile.size - item.convertedFile.size)}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <IconButton
                  onClick={() => onRemoveHistoryItem(item.id)}
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConversionHistory;
