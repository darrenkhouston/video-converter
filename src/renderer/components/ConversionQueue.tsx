import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Delete,
  CheckCircle,
  Error as ErrorIcon,
  Cancel,
  Pending,
} from '@mui/icons-material';
import type { ConversionJob } from '../../shared/types';

interface ConversionQueueProps {
  queue: ConversionJob[];
  onRemoveFromQueue: (jobId: string) => void;
  onClearQueue: () => void;
  onCancelConversion: (jobId: string) => void;
}

const ConversionQueue: React.FC<ConversionQueueProps> = ({
  queue,
  onRemoveFromQueue,
  onClearQueue,
  onCancelConversion,
}) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getStatusIcon = (status: ConversionJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'cancelled':
        return <Cancel color="warning" />;
      case 'processing':
        return <Pending color="primary" />;
      default:
        return <Pending color="disabled" />;
    }
  };

  const getStatusColor = (status: ConversionJob['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  const calculateTimeSaved = (job: ConversionJob) => {
    if (!job.startTime || !job.endTime) return null;
    const duration = (job.endTime - job.startTime) / 1000;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}m ${seconds}s`;
  };

  const completedJobs = queue.filter((j) => j.status === 'completed').length;
  const failedJobs = queue.filter((j) => j.status === 'failed').length;
  const processingJobs = queue.filter((j) => j.status === 'processing').length;
  const queuedJobs = queue.filter((j) => j.status === 'queued').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Conversion Queue ({queue.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {processingJobs > 0 && (
            <Button variant="outlined" color="warning" onClick={() => {
              queue.filter(j => j.status === 'processing').forEach(j => onCancelConversion(j.id));
            }}>
              Stop All
            </Button>
          )}
          {queue.length > 0 && (
            <Button variant="outlined" color="error" onClick={onClearQueue}>
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {queue.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Chip label={`Queued: ${queuedJobs}`} color="default" />
          <Chip label={`Processing: ${processingJobs}`} color="primary" />
          <Chip label={`Completed: ${completedJobs}`} color="success" />
          {failedJobs > 0 && <Chip label={`Failed: ${failedJobs}`} color="error" />}
        </Box>
      )}

      {queue.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No conversions in queue
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add files from the Files & Conversion tab to get started
          </Typography>
        </Paper>
      ) : (
        <List>
          {queue.map((job) => (
            <Paper key={job.id} sx={{ mb: 2 }}>
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getStatusIcon(job.status)}
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1">{job.inputFile.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.inputFile.width}x{job.inputFile.height} → {job.settings.resolution?.width || job.inputFile.width}x{job.settings.resolution?.height || job.inputFile.height} • {job.settings.videoCodec.toUpperCase()}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status.toUpperCase()}
                      color={getStatusColor(job.status) as any}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    {job.status === 'processing' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onCancelConversion(job.id)}
                        sx={{ mr: 1 }}
                      >
                        Stop
                      </Button>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveFromQueue(job.id)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>

                  {job.status === 'processing' && (
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress variant="determinate" value={job.progress} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {job.progress.toFixed(1)}%
                      </Typography>
                    </Box>
                  )}

                  {job.status === 'completed' && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Original: {formatSize(job.inputFile.size)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Converted: {formatSize(job.outputSize)}
                      </Typography>
                      {job.outputSize && job.inputFile.size && (
                        <Typography variant="caption" color="success.main">
                          Saved: {((1 - job.outputSize / job.inputFile.size) * 100).toFixed(1)}%
                        </Typography>
                      )}
                      {calculateTimeSaved(job) && (
                        <Typography variant="caption" color="text.secondary">
                          Time: {calculateTimeSaved(job)}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {job.status === 'failed' && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      Error: {job.error}
                    </Typography>
                  )}

                  {job.outputPath && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Output: {job.outputPath}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ConversionQueue;
