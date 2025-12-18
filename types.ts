// types.ts
export type JsRuntime = 'deno' | 'node' | 'quickjs' | 'bun';

export interface YtdlpCommandBuilderConstructorOptions {
  ytdlpPath?: string;
}

export const SUPPORTED_COOKIE_BROWSERS = [
  'brave',
  'chrome',
  'chromium',
  'edge',
  'firefox',
  'opera',
  'safari',
  'vivaldi',
  'whale'
] as const;

export type SupportedCookieBrowser = (typeof SUPPORTED_COOKIE_BROWSERS)[number];

export type ReleaseChannel = 'stable' | 'nightly' | 'master';

export type RemoteComponent = 'ejs:npm' | 'ejs:github';

export type RetryType = 'http' | 'fragment' | 'file_access' | 'extractor';

export type DownloaderName = 'native' | 'aria2c' | 'axel' | 'curl' | 'ffmpeg' | 'httpie' | 'wget';

export type DownloaderProtocol = 'http' | 'ftp' | 'm3u8' | 'dash' | 'rstp' | 'rtmp' | 'mms';

export type PathType =
  | 'home'
  | 'temp'
  | 'subtitle'
  | 'thumbnail'
  | 'description'
  | 'annotation'
  | 'infojson'
  | 'link'
  | 'pl_thumbnail'
  | 'pl_description'
  | 'pl_infojson'
  | 'chapter'
  | 'pl_video';

export type Keyring = 'basictext' | 'gnomekeyring' | 'kwallet' | 'kwallet5' | 'kwallet6';

export type PrintWhen =
  | 'video'
  | 'pre_process'
  | 'after_filter'
  | 'before_dl'
  | 'post_process'
  | 'after_move'
  | 'after_video'
  | 'playlist'
  | 'after_playlist';

export type ProgressTemplateType =
  | 'download'
  | 'download-title'
  | 'postprocess'
  | 'postprocess-title';

export type AudioFormat =
  | 'best'
  | 'aac'
  | 'alac'
  | 'flac'
  | 'm4a'
  | 'mp3'
  | 'opus'
  | 'vorbis'
  | 'wav';

export type PostProcessorName =
  | 'Merger'
  | 'ModifyChapters'
  | 'SplitChapters'
  | 'ExtractAudio'
  | 'VideoRemuxer'
  | 'VideoConvertor'
  | 'Metadata'
  | 'EmbedSubtitle'
  | 'EmbedThumbnail'
  | 'SubtitlesConvertor'
  | 'ThumbnailsConvertor'
  | 'FixupStretched'
  | 'FixupM4a'
  | 'FixupM3u8'
  | 'FixupTimestamp'
  | 'FixupDuration';

export type PostProcessorExecutable = 'AtomicParsley' | 'FFmpeg' | 'FFprobe';

export type PostProcessorWhen =
  | 'pre_process'
  | 'after_filter'
  | 'video'
  | 'before_dl'
  | 'post_process'
  | 'after_move'
  | 'after_video'
  | 'playlist';

export type SponsorBlockCategory =
  | 'sponsor'
  | 'intro'
  | 'outro'
  | 'selfpromo'
  | 'preview'
  | 'filler'
  | 'interaction'
  | 'music_offtopic'
  | 'hook'
  | 'poi_highlight'
  | 'chapter'
  | 'all'
  | 'default';
