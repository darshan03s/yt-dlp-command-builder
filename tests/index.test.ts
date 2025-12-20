import { JsRuntime, SupportedCookieBrowser } from '../src/types';
import { YtdlpCommandBuilder } from '../src/ytdlpCommandBuilder';

const YTDLP_PATH = '/path/to/yt-dlp.exe';
const JS_RUNTIME = 'node' as JsRuntime;
const JS_RUNTIME_PATH = '/path/to/jsruntime.exe';
const URL = 'https://www.youtube.com/watch?v=_-AS5DtDeqs';
const FFMPEG_PATH = '/path/to/ffmpegfolder';
const COOKIES_FILE_PATH = '/path/to/cookies.txt';
const COOKIES_BROWSER = 'firefox' as SupportedCookieBrowser;
const COOKIES_BROWSER_PROFILE = 'Profile 1';
const INFO_JSON_PATH = '/path/to/title.info.json';
const FORMAT_CODE = '95+ba';
const OUPUT_PATH = '/path/to/output.ext';

test('Base command with global yt-dlp', () => {
  const command = new YtdlpCommandBuilder();
  const toBe = 'yt-dlp';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('Base command with yt-dlp path', () => {
  const command = new YtdlpCommandBuilder('/path/to/yt-dlp.exe');
  const toBe = YTDLP_PATH;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('version', () => {
  const command = new YtdlpCommandBuilder().version();
  const toBe = 'yt-dlp --version';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('Multiple version', () => {
  expect(() => {
    new YtdlpCommandBuilder().version().version().version();
  }).toThrow('Cannot call version more than once');
});

test('help', () => {
  const command = new YtdlpCommandBuilder().help();
  const toBe = 'yt-dlp --help';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('Multiple help', () => {
  expect(() => {
    new YtdlpCommandBuilder().help().help().help();
  }).toThrow('Cannot call help more than once');
});

test('no update', () => {
  const command = new YtdlpCommandBuilder().noUpdate();
  const toBe = 'yt-dlp --no-update';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('Multiple no update', () => {
  expect(() => {
    new YtdlpCommandBuilder().noUpdate().noUpdate().noUpdate();
  }).toThrow('Cannot call noUpdate more than once');
});

test('update to stable latest', () => {
  const command = new YtdlpCommandBuilder().updateTo();
  const toBe = 'yt-dlp --update-to stable@latest';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('update to master', () => {
  const command = new YtdlpCommandBuilder().updateTo('master', '2025.12.19.004513');
  const toBe = 'yt-dlp --update-to master@2025.12.19.004513';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('url', () => {
  const command = new YtdlpCommandBuilder().url(URL);
  const toBe = `yt-dlp ${URL}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('Multiple url', () => {
  expect(() => {
    new YtdlpCommandBuilder().url(URL).url(URL);
  }).toThrow('Cannot call url more than once');
});

test('js runtime deno', () => {
  const command = new YtdlpCommandBuilder().jsRuntime('deno');
  const toBe = 'yt-dlp --js-runtimes deno';
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('js runtime custom', () => {
  const command = new YtdlpCommandBuilder().jsRuntime(JS_RUNTIME);
  const toBe = `yt-dlp --js-runtimes ${JS_RUNTIME}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('js runtime custom with path', () => {
  const command = new YtdlpCommandBuilder().jsRuntime(JS_RUNTIME, JS_RUNTIME_PATH);
  const toBe = `yt-dlp --js-runtimes ${JS_RUNTIME}:${JS_RUNTIME_PATH}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('ffmpeg location', () => {
  const command = new YtdlpCommandBuilder().ffmpegLocation(FFMPEG_PATH);
  const toBe = `yt-dlp --ffmpeg-location ${FFMPEG_PATH}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies file', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookies(COOKIES_FILE_PATH);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies ${COOKIES_FILE_PATH}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE });
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, url', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .url(URL);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} ${URL}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, write info json, output, url', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .writeInfoJson()
    .output(INFO_JSON_PATH)
    .url(URL);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --write-info-json --output ${INFO_JSON_PATH} ${URL}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, format, output', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .format(FORMAT_CODE)
    .output(OUPUT_PATH);
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --format ${FORMAT_CODE} --output ${OUPUT_PATH}`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, format, output, merge output format', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .format(FORMAT_CODE)
    .output(OUPUT_PATH)
    .mergeOutputFormat('mp4');
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --format ${FORMAT_CODE} --output ${OUPUT_PATH} --merge-output-format mp4`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, format, output, merge output format', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .format(FORMAT_CODE)
    .output(OUPUT_PATH)
    .mergeOutputFormat('mp4/mkv');
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --format ${FORMAT_CODE} --output ${OUPUT_PATH} --merge-output-format mp4/mkv`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('get: yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, format, output, merge output format', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .format(FORMAT_CODE)
    .output(OUPUT_PATH)
    .mergeOutputFormat('mp4/mkv');

  const baseCommand = YTDLP_PATH;
  const args = [
    '--js-runtimes',
    `quickjs:${JS_RUNTIME_PATH}`,
    '--ffmpeg-location',
    FFMPEG_PATH,
    '--cookies-from-browser',
    `${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE}`,
    '--load-info-json',
    INFO_JSON_PATH,
    '--format',
    FORMAT_CODE,
    '--output',
    OUPUT_PATH,
    '--merge-output-format',
    'mp4/mkv'
  ];

  const completeCommand = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --format ${FORMAT_CODE} --output ${OUPUT_PATH} --merge-output-format mp4/mkv`;
  const get = command.get();
  const toBe = {
    baseCommand,
    args,
    completeCommand
  };
  console.log(get);
  expect(get).toStrictEqual(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, list formats', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .listFormats();
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --list-formats`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, list formats, live from start', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .listFormats()
    .liveFromStart();
  const toBe = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --list-formats --live-from-start`;
  const build = command.build();
  console.log(build);
  expect(build).toBe(toBe);
});

test('get: yt-dlp path, js runtime custom with path, ffmpeg location, cookies browser with profile, load info json, list formats, live from start', () => {
  const command = new YtdlpCommandBuilder(YTDLP_PATH)
    .jsRuntime('quickjs', JS_RUNTIME_PATH)
    .ffmpegLocation(FFMPEG_PATH)
    .cookiesFromBrowser(COOKIES_BROWSER, { profile: COOKIES_BROWSER_PROFILE })
    .loadInfoJson(INFO_JSON_PATH)
    .listFormats()
    .liveFromStart();

  const baseCommand = YTDLP_PATH;
  const args = [
    '--js-runtimes',
    `quickjs:${JS_RUNTIME_PATH}`,
    '--ffmpeg-location',
    FFMPEG_PATH,
    '--cookies-from-browser',
    `${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE}`,
    '--load-info-json',
    INFO_JSON_PATH,
    '--list-formats',
    '--live-from-start'
  ];

  const completeCommand = `${YTDLP_PATH} --js-runtimes quickjs:${JS_RUNTIME_PATH} --ffmpeg-location ${FFMPEG_PATH} --cookies-from-browser ${COOKIES_BROWSER}:${COOKIES_BROWSER_PROFILE} --load-info-json ${INFO_JSON_PATH} --list-formats --live-from-start`;
  const get = command.get();
  const toBe = {
    baseCommand,
    args,
    completeCommand
  };
  console.log(get);
  expect(get).toStrictEqual(toBe);
});
