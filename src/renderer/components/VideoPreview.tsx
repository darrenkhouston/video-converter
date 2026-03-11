import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Close,
  Info,
  VideoLibrary,
  AudioFile,
  Subtitles,
} from '@mui/icons-material';
import type { VideoFile } from '../../shared/types';

interface VideoPreviewProps {
  open: boolean;
  onClose: () => void;
  videoFile: VideoFile | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ open, onClose, videoFile }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open && videoFile) {
      generateThumbnails();
    }
    return () => {
      setThumbnails([]);
      setPlaying(false);
      setCurrentTime(0);
    };
  }, [open, videoFile]);

  const generateThumbnails = async () => {
    if (!videoFile) return;

    setLoadingThumbnails(true);
    try {
      // Generate thumbnails at 0%, 25%, 50%, 75%, 100% of video duration
      const timestamps = [0, 0.25, 0.5, 0.75, 1].map(
        (ratio) => Math.floor(videoFile.duration * ratio)
      );

      const thumbs = await window.electron.generateThumbnails(
        videoFile.path,
        timestamps
      );
      setThumbnails(thumbs);
    } catch (error) {
      console.error('Failed to generate thumbnails:', error);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    videoRef.current.requestFullscreen();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeekToThumbnail = (timestamp: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timestamp;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatBitrate = (bps: number): string => {
    return Math.round(bps / 1000) + ' kbps';
  };

  if (!videoFile) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'background.default', minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibrary color="primary" />
            <Typography variant="h6">Video Preview</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Video Player */}
          <Grid item xs={12}>
            <Paper sx={{ bgcolor: 'black', position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <video
                ref={videoRef}
                src={`video-file://${videoFile.path}`}
                style={{
                  width: '100%',
                  maxHeight: '500px',
                  display: 'block',
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setPlaying(false)}
              />

              {/* Video Controls Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <IconButton onClick={handlePlayPause} size="small" sx={{ color: 'white' }}>
                  {playing ? <Pause /> : <PlayArrow />}
                </IconButton>

                <Typography variant="caption" sx={{ color: 'white', minWidth: 60 }}>
                  {formatDuration(currentTime)} / {formatDuration(videoFile.duration)}
                </Typography>

                <Box sx={{ flex: 1 }} />

                <IconButton onClick={handleMuteToggle} size="small" sx={{ color: 'white' }}>
                  {muted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>

                <IconButton onClick={handleFullscreen} size="small" sx={{ color: 'white' }}>
                  <Fullscreen />
                </IconButton>
              </Box>
            </Paper>
          </Grid>

          {/* Thumbnails */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize="small" />
                Frame Preview
              </Typography>

              {loadingThumbnails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Generating thumbnails...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={1}>
                  {thumbnails.map((thumb, index) => {
                    const timestamp = Math.floor(videoFile.duration * [0, 0.25, 0.5, 0.75, 1][index]);
                    return (
                      <Grid item xs={2.4} key={index}>
                        <Tooltip title={`Jump to ${formatDuration(timestamp)}`}>
                          <Paper
                            sx={{
                              cursor: 'pointer',
                              overflow: 'hidden',
                              border: '2px solid transparent',
                              '&:hover': {
                                opacity: 0.8,
                                borderColor: 'primary.main'
                              },
                            }}
                            onClick={() => handleSeekToThumbnail(timestamp)}
                          >
                            <img
                              src={thumb}
                              alt={`Frame at ${timestamp}s`}
                              style={{
                                width: '100%',
                                display: 'block',
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'center',
                                py: 0.5,
                                bgcolor: 'background.paper',
                              }}
                            >
                              {formatDuration(timestamp)}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Video Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoLibrary fontSize="small" />
                Video Information
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">File Name:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{videoFile.name}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Format:</Typography>
                  <Chip label={videoFile.format.toUpperCase()} size="small" />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Duration:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDuration(videoFile.duration)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">File Size:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatFileSize(videoFile.size)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Resolution:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {videoFile.width} × {videoFile.height}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Video Codec:</Typography>
                  <Chip label={videoFile.codec.toUpperCase()} size="small" color="primary" />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Frame Rate:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {videoFile.fps} fps
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Bitrate:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatBitrate(videoFile.bitrate)}
                  </Typography>
                </Box>

                {videoFile.isHDR && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">HDR:</Typography>
                    <Chip label="HDR" size="small" color="secondary" />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Audio & Subtitle Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AudioFile fontSize="small" />
                Audio Tracks ({videoFile.audioTracks?.length || 0})
              </Typography>
              <Divider sx={{ my: 1 }} />

              {videoFile.audioTracks && videoFile.audioTracks.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {videoFile.audioTracks.map((track, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Track {track.index}
                        </Typography>
                        <Chip label={track.codec.toUpperCase()} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {track.channels} channels • {Math.round(track.sampleRate / 1000)} kHz
                        {track.language && ` • ${track.language}`}
                        {track.title && ` • ${track.title}`}
                      </Typography>
                      {index < videoFile.audioTracks.length - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No audio tracks
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Subtitles fontSize="small" />
                Subtitle Tracks ({videoFile.subtitles?.length || 0})
              </Typography>
              <Divider sx={{ my: 1 }} />

              {videoFile.subtitles && videoFile.subtitles.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {videoFile.subtitles.map((sub, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        Track {sub.index}
                        {sub.language && ` (${sub.language})`}
                        {sub.title && ` - ${sub.title}`}
                      </Typography>
                      <Chip label={sub.codec.toUpperCase()} size="small" />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No subtitle tracks
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoPreview;
