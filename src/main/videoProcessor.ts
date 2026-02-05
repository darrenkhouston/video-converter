import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import type {
  VideoFile,
  ConversionJob,
  ConversionSettings,
  HardwareInfo,
  FFmpegProgress,
  AudioTrack,
  SubtitleTrack,
} from '../shared/types';

const stat = promisify(fs.stat);

// Helper function to handle asar unpacked paths
function getUnpackedPath(asarPath: string): string {
  // In production, binaries are unpacked to app.asar.unpacked
  if (asarPath.includes('app.asar')) {
    return asarPath.replace('app.asar', 'app.asar.unpacked');
  }
  return asarPath;
}

// Set FFmpeg and FFprobe paths
const ffmpegPath = getUnpackedPath(ffmpegInstaller.path);
const ffprobePath = getUnpackedPath(ffprobeInstaller.path);

console.log('FFmpeg path:', ffmpegPath);
console.log('FFprobe path:', ffprobePath);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export class VideoProcessor {
  private activeJobs: Map<string, ffmpeg.FfmpegCommand> = new Map();
  private queue: ConversionJob[] = [];
  private hardwareInfo: HardwareInfo | null = null;

  constructor() {
    this.detectHardware();
  }

  private async detectHardware(): Promise<void> {
    // Detect available hardware encoders
    return new Promise((resolve) => {
      ffmpeg()
        .getAvailableEncoders((err, encoders) => {
          if (err) {
            console.error('Error detecting encoders:', err);
            this.hardwareInfo = {
              cpu: 'Unknown',
              gpu: [],
              availableEncoders: {
                nvenc: false,
                qsv: false,
                amf: false,
              },
            };
            resolve();
            return;
          }

          this.hardwareInfo = {
            cpu: 'Unknown',
            gpu: [],
            availableEncoders: {
              nvenc: encoders.h264_nvenc !== undefined || encoders.hevc_nvenc !== undefined,
              qsv: encoders.h264_qsv !== undefined || encoders.hevc_qsv !== undefined,
              amf: encoders.h264_amf !== undefined || encoders.hevc_amf !== undefined,
            },
          };
          resolve();
        });
    });
  }

  async getHardwareInfo(): Promise<HardwareInfo> {
    if (!this.hardwareInfo) {
      await this.detectHardware();
    }
    return this.hardwareInfo!;
  }

  async getVideoInfo(filePath: string): Promise<VideoFile> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, async (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');
        const audioTracks: AudioTrack[] = metadata.streams
          .filter((s) => s.codec_type === 'audio')
          .map((s, index) => ({
            index,
            codec: s.codec_name || 'unknown',
            channels: s.channels || 0,
            sampleRate: s.sample_rate ? parseInt(s.sample_rate as any) : 0,
            language: s.tags?.language,
            title: s.tags?.title,
          }));

        const subtitles: SubtitleTrack[] = metadata.streams
          .filter((s) => s.codec_type === 'subtitle')
          .map((s, index) => ({
            index,
            language: s.tags?.language,
            title: s.tags?.title,
            codec: s.codec_name || 'unknown',
          }));

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const fileStats = await stat(filePath);
        const fileName = path.basename(filePath);

        // Detect HDR content
        const isHDR = this.detectHDRContent(videoStream);

        const videoFile: VideoFile = {
          id: Date.now().toString(),
          path: filePath,
          name: fileName,
          size: fileStats.size,
          duration: metadata.format.duration || 0,
          format: metadata.format.format_name || 'unknown',
          codec: videoStream.codec_name || 'unknown',
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFps(videoStream.r_frame_rate),
          bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate as any) : 0,
          audioCodec: audioStream?.codec_name,
          audioChannels: audioStream?.channels,
          audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate as any) : undefined,
          audioTracks,
          subtitles,
          isHDR,
        };

        resolve(videoFile);
      });
    });
  }

  private parseFps(fpsString?: string): number {
    if (!fpsString) return 0;
    const parts = fpsString.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(fpsString);
  }

  private detectHDRContent(videoStream: any): boolean {
    // Check for HDR indicators in video stream
    // HDR is typically indicated by:
    // 1. Color transfer characteristic (color_transfer) being PQ (smpte2084) or HLG (arib-std-b67)
    // 2. Color space (color_space) being bt2020nc
    // 3. Color primaries (color_primaries) being bt2020
    
    const colorTransfer = videoStream.color_transfer?.toLowerCase();
    const colorSpace = videoStream.color_space?.toLowerCase();
    const colorPrimaries = videoStream.color_primaries?.toLowerCase();
    
    // Check for HDR transfer functions
    const isHDRTransfer = colorTransfer === 'smpte2084' || // HDR10
                          colorTransfer === 'arib-std-b67' || // HLG
                          colorTransfer === 'smpte428';        // DCI-P3
    
    // Check for wide color gamut
    const isWideGamut = colorSpace === 'bt2020nc' || 
                        colorSpace === 'bt2020c' ||
                        colorPrimaries === 'bt2020';
    
    return isHDRTransfer || isWideGamut;
  }

  async startConversion(
    inputPath: string,
    outputPath: string,
    settings: ConversionSettings,
    onProgress: (progress: FFmpegProgress & { jobId: string }) => void,
    onError: (error: { jobId: string; message: string }) => void,
    onComplete: (job: ConversionJob) => void
  ): Promise<string> {
    const jobId = Date.now().toString();
    const inputFile = await this.getVideoInfo(inputPath);

    const job: ConversionJob = {
      id: jobId,
      inputFile,
      outputPath,
      settings,
      status: 'queued',
      progress: 0,
    };

    this.queue.push(job);

    // Start conversion
    this.processJob(job, onProgress, onError, onComplete);

    return jobId;
  }

  private async processJob(
    job: ConversionJob,
    onProgress: (progress: FFmpegProgress & { jobId: string }) => void,
    onError: (error: { jobId: string; message: string }) => void,
    onComplete: (job: ConversionJob) => void
  ): Promise<void> {
    job.status = 'processing';
    job.startTime = Date.now();

    console.log('Starting conversion:', {
      input: job.inputFile.path,
      output: job.outputPath,
      settings: job.settings,
    });

    const command = ffmpeg(job.inputFile.path);

    // Apply hardware acceleration
    const videoEncoder = this.getVideoEncoder(job.settings);
    const audioEncoder = this.getAudioEncoder(job.settings.audioCodec);

    console.log('Using encoders:', { video: videoEncoder, audio: audioEncoder });

    // Input options for hardware decoding (if available)
    if (job.settings.hardwareAcceleration !== 'none' && job.settings.hardwareAcceleration !== 'auto') {
      const hwaccel = this.getHardwareAccel(job.settings.hardwareAcceleration);
      if (hwaccel) {
        console.log('Using hardware acceleration:', hwaccel);
        command.inputOptions(['-hwaccel', hwaccel]);
      }
    }

    // Video codec
    console.log('Setting video codec:', videoEncoder);
    command.videoCodec(videoEncoder);

    // Resolution
    if (job.settings.resolution) {
      command.size(`${job.settings.resolution.width}x${job.settings.resolution.height}`);
    }

    // Check if input is HDR and user wants tone mapping
    const isHDR = job.inputFile.codec.toLowerCase().includes('hevc') || 
                  job.inputFile.codec.toLowerCase().includes('h265');
    
    // Only apply tone mapping if explicitly enabled AND input is HDR
    if (isHDR && job.settings.hdrToneMapping) {
      // Apply HDR to SDR tone mapping
      const videoFilters: string[] = [];
      
      // Simplified tone mapping
      videoFilters.push('format=yuv420p10le,zscale=t=linear,tonemap=hable,zscale=t=bt709:m=bt709:r=tv,format=yuv420p');
      
      // Apply resolution scaling if needed
      if (job.settings.resolution) {
        videoFilters.push(`scale=${job.settings.resolution.width}:${job.settings.resolution.height}`);
      }
      
      command.videoFilters(videoFilters.join(','));
      console.log('Applying HDR to SDR tone mapping (WARNING: This is slow)');
    } else {
      // No tone mapping - just scale if needed
      if (job.settings.resolution) {
        command.size(`${job.settings.resolution.width}x${job.settings.resolution.height}`);
      }
      if (isHDR && !job.settings.hdrToneMapping) {
        console.log('HDR input detected but tone mapping disabled - output may look washed out');
      }
    }

    // Quality settings
    if (job.settings.crf !== undefined) {
      command.outputOptions([`-crf`, `${job.settings.crf}`]);
    } else if (job.settings.bitrate) {
      command.videoBitrate(job.settings.bitrate);
    }

    // Frame rate
    if (job.settings.fps) {
      command.fps(job.settings.fps);
    }

    // Audio codec and ensure audio is included
    // Check if audio passthrough is requested
    if (job.settings.audioMode === 'copy') {
      command.audioCodec('copy');
      console.log('Using audio passthrough (copy)');
    } else {
      command.audioCodec(audioEncoder);
      console.log('Setting audio codec:', audioEncoder);
    }

    // Audio track selection - must come before audio settings
    if (job.settings.selectedAudioTrack !== undefined) {
      command.outputOptions([`-map`, `0:v:0`, `-map`, `0:a:${job.settings.selectedAudioTrack}`]);
      console.log('Mapping specific audio track:', job.settings.selectedAudioTrack);
    } else {
      // Ensure we map the first video and audio stream
      command.outputOptions(['-map', '0:v:0', '-map', '0:a:0']);
      console.log('Mapping default video and audio streams');
    }

    // Subtitle handling - add subtitle mapping if enabled
    if (job.settings.embedSubtitles) {
      if (job.settings.selectedSubtitleTrack !== undefined) {
        // Map specific subtitle track
        command.outputOptions(['-map', `0:s:${job.settings.selectedSubtitleTrack}`]);
        console.log('Mapping subtitle track:', job.settings.selectedSubtitleTrack);
      } else if (job.inputFile.subtitles && job.inputFile.subtitles.length > 0) {
        // Map all subtitle tracks
        command.outputOptions(['-map', '0:s?']);
        console.log('Mapping all subtitle tracks');
      }
      
      // Set subtitle codec based on container
      if (job.settings.outputFormat === 'mp4' || job.settings.outputFormat === 'mov') {
        // Force conversion to mov_text for MP4/MOV compatibility with Windows Media Player
        command.outputOptions(['-c:s', 'mov_text']);
        // Ensure subtitles are compatible with MP4 standard
        command.outputOptions(['-disposition:s:0', 'default']);
        console.log('Converting subtitles to mov_text for MP4/MOV');
      } else if (job.settings.outputFormat === 'mkv') {
        // MKV supports many subtitle formats, try to copy first
        command.outputOptions(['-c:s', 'srt']);
        console.log('Converting subtitles to SRT for MKV');
      } else {
        // For other formats, try mov_text
        command.outputOptions(['-c:s', 'mov_text']);
        console.log('Converting subtitles to mov_text');
      }
    }

    // Audio settings - must come after mapping
    // Only apply audio encoding settings if not in passthrough mode
    if (job.settings.audioMode !== 'copy') {
      const finalAudioBitrate = job.settings.audioBitrate || (audioEncoder === 'aac' ? '192k' : undefined);
      if (finalAudioBitrate) {
        command.audioBitrate(finalAudioBitrate);
        console.log('Setting audio bitrate:', finalAudioBitrate);
      }
      
      // Handle channel downmixing with audio filter if needed
      if (job.settings.audioChannels && job.settings.audioChannels !== job.inputFile.audioChannels) {
        if (job.settings.audioChannels === 2) {
          // Force stereo downmix using audio filter
          command.audioFilters([
            {
              filter: 'pan',
              options: 'stereo|FL=FC+0.30*FL+0.30*FLC+0.30*BL+0.30*SL+0.30*LFE|FR=FC+0.30*FR+0.30*FRC+0.30*BR+0.30*SR+0.30*LFE'
            }
          ]);
          console.log('Applying stereo downmix filter');
        }
        command.outputOptions(['-ac', `${job.settings.audioChannels}`]);
        console.log('Setting audio channels to:', job.settings.audioChannels);
      }
      
      if (job.settings.audioSampleRate) {
        command.outputOptions(['-ar', `${job.settings.audioSampleRate}`]);
        console.log('Setting audio sample rate:', job.settings.audioSampleRate);
      }
    } else {
      console.log('Skipping audio encoding settings (passthrough mode)');
    }

    // Metadata
    if (job.settings.preserveMetadata) {
      command.outputOptions(['-map_metadata 0']);
    }

    // Trimming
    if (job.settings.trimStart !== undefined) {
      command.setStartTime(job.settings.trimStart);
    }
    if (job.settings.trimEnd !== undefined) {
      command.setDuration(job.settings.trimEnd - (job.settings.trimStart || 0));
    }

    // Output format
    command.format(job.settings.outputFormat);
    
    // Add standard MP4 options for better compatibility
    if (job.settings.outputFormat === 'mp4') {
      command.outputOptions([
        '-movflags', '+faststart', // Enable streaming
        '-pix_fmt', 'yuv420p'      // Ensure standard pixel format for compatibility
      ]);
    }

    // Progress tracking
    command.on('progress', (progress) => {
      job.progress = progress.percent || 0;
      onProgress({
        frames: progress.frames || 0,
        currentFps: progress.currentFps || 0,
        currentKbps: progress.currentKbps || 0,
        targetSize: progress.targetSize || 0,
        timemark: progress.timemark || '00:00:00',
        percent: progress.percent || 0,
        jobId: job.id,
      });
    });

    // Error handling
    command.on('error', (err, stdout, stderr) => {
      console.error('FFmpeg error:', err);
      console.error('FFmpeg stdout:', stdout);
      console.error('FFmpeg stderr:', stderr);
      job.status = 'failed';
      job.error = err.message;
      job.endTime = Date.now();
      this.activeJobs.delete(job.id);
      onError({
        jobId: job.id,
        message: `${err.message}\nStderr: ${stderr}`,
      });
    });

    // Completion
    command.on('end', async () => {
      console.log('FFmpeg conversion completed successfully');
      job.status = 'completed';
      job.endTime = Date.now();
      job.progress = 100;
      
      try {
        const outputStats = await stat(job.outputPath);
        job.outputSize = outputStats.size;
        console.log('Output file size:', outputStats.size);
      } catch (err) {
        console.error('Error getting output file stats:', err);
      }

      this.activeJobs.delete(job.id);
      onComplete(job);
    });

    // Save command and start
    console.log('FFmpeg command starting...');
    console.log('Output path:', job.outputPath);
    
    // Log the full FFmpeg command for debugging
    command.on('start', (commandLine) => {
      console.log('FFmpeg command:', commandLine);
    });
    
    this.activeJobs.set(job.id, command);
    command.save(job.outputPath);
  }

  private getVideoEncoder(settings: ConversionSettings): string {
    const codec = settings.videoCodec;
    const hwaccel = settings.hardwareAcceleration;

    // Force software encoding for now since hardware detection isn't reliable
    // Users can manually select hardware if they want
    if (hwaccel === 'auto' || hwaccel === 'none') {
      console.log('Using software encoder (CPU)');
      return codec === 'hevc' ? 'libx265' : codec === 'vp9' ? 'libvpx-vp9' : 'libx264';
    }
    
    // Only use hardware if explicitly selected
    if (hwaccel === 'nvenc' && this.hardwareInfo?.availableEncoders.nvenc) {
      return codec === 'hevc' ? 'hevc_nvenc' : 'h264_nvenc';
    } else if (hwaccel === 'qsv' && this.hardwareInfo?.availableEncoders.qsv) {
      return codec === 'hevc' ? 'hevc_qsv' : 'h264_qsv';
    } else if (hwaccel === 'amf' && this.hardwareInfo?.availableEncoders.amf) {
      return codec === 'hevc' ? 'hevc_amf' : 'h264_amf';
    }

    // Fallback to software encoding
    console.log('Falling back to software encoder (CPU)');
    return codec === 'hevc' ? 'libx265' : codec === 'vp9' ? 'libvpx-vp9' : 'libx264';
  }

  private getAudioEncoder(audioCodec: string): string {
    switch (audioCodec) {
      case 'aac':
        return 'aac';
      case 'mp3':
        return 'libmp3lame';
      case 'opus':
        return 'libopus';
      case 'vorbis':
        return 'libvorbis';
      case 'flac':
        return 'flac';
      case 'ac3':
        return 'ac3';
      default:
        return 'aac';
    }
  }

  private getHardwareAccel(type: string): string | null {
    switch (type) {
      case 'nvenc':
        return 'cuda';
      case 'qsv':
        return 'qsv';
      case 'amf':
        return 'dxva2';
      default:
        return null;
    }
  }

  async cancelConversion(jobId: string): Promise<boolean> {
    const command = this.activeJobs.get(jobId);
    if (command) {
      command.kill('SIGKILL');
      this.activeJobs.delete(jobId);
      
      const job = this.queue.find((j) => j.id === jobId);
      if (job) {
        job.status = 'cancelled';
      }
      
      return true;
    }
    return false;
  }

  getQueue(): ConversionJob[] {
    return this.queue;
  }

  removeFromQueue(jobId: string): boolean {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  clearQueue(): boolean {
    this.queue = [];
    return true;
  }

  async generateThumbnail(filePath: string, timestamp: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        path.dirname(filePath),
        `thumb_${Date.now()}.png`
      );

      ffmpeg(filePath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x240',
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
