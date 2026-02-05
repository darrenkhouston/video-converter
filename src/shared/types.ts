export interface VideoFile {
  id: string;
  path: string;
  name: string;
  size: number;
  duration: number;
  format: string;
  codec: string;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  isHDR?: boolean;
}

export interface AudioTrack {
  index: number;
  codec: string;
  channels: number;
  sampleRate: number;
  language?: string;
  title?: string;
}

export interface SubtitleTrack {
  index: number;
  language?: string;
  title?: string;
  codec: string;
}

export interface ConversionJob {
  id: string;
  inputFile: VideoFile;
  outputPath: string;
  settings: ConversionSettings;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  outputSize?: number;
}

export interface ConversionSettings {
  mode: 'simple' | 'advanced';
  outputFormat: string;
  videoCodec: string;
  audioCodec: string;
  audioMode?: 'convert' | 'copy'; // 'convert' = reencode to specified codec, 'copy' = passthrough original
  hdrToneMapping?: boolean; // Enable HDR to SDR tone mapping (slower but better colors)
  resolution?: {
    width: number;
    height: number;
  };
  preset?: string;
  crf?: number;
  bitrate?: string;
  fps?: number;
  audioChannels?: number;
  audioSampleRate?: number;
  audioBitrate?: string;
  hardwareAcceleration: 'auto' | 'nvenc' | 'qsv' | 'amf' | 'none';
  trimStart?: number;
  trimEnd?: number;
  selectedAudioTrack?: number;
  embedSubtitles?: boolean;
  selectedSubtitleTrack?: number;
  preserveMetadata: boolean;
}

export interface ConversionPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<ConversionSettings>;
}

export interface HardwareInfo {
  cpu: string;
  gpu: string[];
  availableEncoders: {
    nvenc: boolean;
    qsv: boolean;
    amf: boolean;
  };
}

export interface FFmpegProgress {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent: number;
}

export interface ConversionHistory {
  id: string;
  timestamp: number;
  originalFile: {
    name: string;
    path: string;
    size: number;
    format: string;
    codec: string;
    resolution: string;
    duration: number;
  };
  convertedFile: {
    path: string;
    size: number;
    format: string;
    codec: string;
    resolution: string;
  };
  settings: ConversionSettings;
  duration: number; // conversion duration in ms
}
