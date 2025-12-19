// ytdlpCommandBuilder.ts
import {
  AudioFormat,
  DownloaderName,
  DownloaderProtocol,
  JsRuntime,
  Keyring,
  PathType,
  PostProcessorExecutable,
  PostProcessorName,
  PostProcessorWhen,
  PrintWhen,
  ProgressTemplateType,
  ReleaseChannel,
  RemoteComponent,
  RetryType,
  SponsorBlockCategory,
  SupportedCookieBrowser,
  YtdlpCommandBuilderConstructorOptions
} from './types';

export class YtdlpCommandBuilder {
  private ytdlpCommandOrPath: 'yt-dlp' | string;
  private args: string[] = [];
  private completeCommand = '';
  private methodCalled: Map<string, boolean>;

  /**
   * Initializes a new instance of the YtdlpCommandBuilder class.
   * @param options Configuration options for the command builder.
   */
  constructor(options: YtdlpCommandBuilderConstructorOptions = {}) {
    this.ytdlpCommandOrPath = options.ytdlpPath ?? 'yt-dlp';

    this.methodCalled = new Map();

    this.completeCommand = this.completeCommand.concat(this.ytdlpCommandOrPath);
  }

  /**
   * Builds the complete yt-dlp command string.
   * @returns The complete yt-dlp command string.
   */
  build() {
    this.combine();
    return this.completeCommand;
  }

  /**
   * Combines the base command and arguments into a complete command string.
   */
  private combine() {
    this.completeCommand = this.ytdlpCommandOrPath.concat(' ').concat(this.args.join(' ').trim());
  }

  /**
   * Gets the command components.
   * @returns An object containing the base command, arguments, and complete command string.
   */
  get() {
    this.combine();
    return {
      baseCommand: this.ytdlpCommandOrPath,
      args: this.args,
      completeCommand: this.completeCommand
    };
  }

  /**
   * Adds an argument to the command.
   * @param arg The argument to add.
   */
  private add(arg: string) {
    this.args.push(arg);
  }

  /**
   * Checks if a method has already been called.
   * @param methodName The name of the method to check.
   */
  private isCalled(methodName: string) {
    if (this.methodCalled.get(methodName)) {
      throw new Error(`Cannot call ${methodName} more than once`);
    }
  }

  /**
   * Marks a method as called.
   * @param methodName The name of the method to mark as called.
   */
  private called(methodName: string) {
    this.methodCalled.set(methodName, true);
  }

  /**
   * Ensures a method is called only once and adds the corresponding argument.
   * @param methodName The name of the method.
   * @param arg The argument to add.
   */
  private once(methodName: string, arg: string) {
    this.isCalled(methodName);
    this.add(arg);
    this.called(methodName);
  }

  /**
   * Print this help text and exit
   */
  help() {
    this.add('--help');
  }

  /**
   * Print program version and exit
   */
  version() {
    this.add('--version');
  }

  /**
   * Update this program to the latest version
   */
  update() {
    this.add('--update');
  }

  /**
   * Do not check for updates (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noUpdate() {
    this.add('--no-update');
    return this;
  }

  /**
   * Upgrade/downgrade to a specific version. CHANNEL can be a repository as well. CHANNEL and TAG default to "stable" and "latest" respectively if omitted; See "UPDATE" for details in the yt-dlp README. Supported channels: stable, nightly, master
   * @param channel Channel to update to from 'stable' | 'nightly' | 'master'. Defaults to 'stable'.
   * @param tag Tag to update to. Defaults to 'latest'.
   */
  updateTo(channel: ReleaseChannel = 'stable', tag: 'latest' | string = 'latest') {
    if (!channel) {
      throw new Error('Channel was not provided');
    }

    this.add('--update-to');
    this.add(`${channel}@${tag}`);
  }

  /**
   * Add the URL of a source.
   * @param url URL of a source.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  url(url: string) {
    if (!url || !url.trim()) {
      throw new Error('URL must be provided');
    }
    this.isCalled('url');
    this.add(url);
    this.called('url');
    return this;
  }

  /**
   * Ignore download and postprocessing errors. The download will be considered successful even if the postprocessing fails
   * @returns The current instance of YtdlpCommandBuilder.
   */
  ignoreErrors() {
    this.once('ignoreErrors', '--ignore-errors');
    return this;
  }

  /**
   * Continue with next video on download errors; e.g. to skip unavailable videos in a playlist (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noAbortOnError() {
    this.once('noAbortOnError', '--no-abort-on-error');
    return this;
  }

  /**
   * Abort downloading of further videos if an error occurs (Alias: --no-ignore-errors)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  abortOnError() {
    this.once('abortOnError', '--abort-on-error');
    return this;
  }

  /**
   * List all supported extractors and exit
   * @returns The current instance of YtdlpCommandBuilder.
   */
  listExtractors() {
    this.once('listExtractors', '--list-extractors');
    return this;
  }

  /**
   * Output descriptions of all supported extractors and exit
   * @returns The current instance of YtdlpCommandBuilder.
   */
  extractorDescriptions() {
    this.once('extractorDescriptions', '--extractor-descriptions');
    return this;
  }

  /**
   * Extractor names to use, separated by commas.
   * You can also use regexes, "all", "default" and "end" (end URL matching).
   * Prefix an extractor with "-" to exclude it.
   *
   * Examples:
   *  - "holodex.*,end,youtube"
   *  - ["default", "-generic"]
   *
   * Alias: --ies
   *
   * @param extractors Extractor names or patterns.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  useExtractors(extractors: string | string[]) {
    if (!extractors || (Array.isArray(extractors) && extractors.length === 0)) {
      throw new Error('Extractor names must be provided');
    }

    const value = Array.isArray(extractors) ? extractors.join(',') : extractors;

    this.add('--use-extractors');
    this.add(value);

    return this;
  }

  /**
   * Use this prefix for unqualified URLs. E.g. "gvsearch2:python" downloads two videos from google videos for the search term "python". Use the value "auto" to let yt-dlp guess ("auto_warning" to emit a warning when guessing). "error" just throws an error. The default value "fixup_error" repairs broken URLs, but emits an error if this is not possible instead of searching
   * @param prefix prefix Search prefix to use for unqualified URLs.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  defaultSearch(prefix: string) {
    if (!prefix || !prefix.trim()) {
      throw new Error('Default search prefix must be provided');
    }

    this.once('defaultSearch', '--default-search');
    this.add(prefix);

    return this;
  }

  /**
   * Don't load any more configuration files except those given to --config-locations.
   * For backward compatibility, if this option is found inside the system configuration
   * file, the user configuration is not loaded.
   * (Alias: --no-config)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  ignoreConfig() {
    this.once('ignoreConfig', '--ignore-config');
    return this;
  }

  /**
   * Do not load any custom configuration files (default).
   * When given inside a configuration file, ignore all previous --config-locations
   * defined in the current file.
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noConfigLocations() {
    this.once('noConfigLocations', '--no-config-locations');
    return this;
  }

  /**
   * Location of the main configuration file; either the path to the config
   * or its containing directory ("-" for stdin). Can be used multiple times
   * and inside other configuration files.
   *
   * @param path Path to the config file, its containing directory, or "-" for stdin.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  configLocations(path: string) {
    if (!path || !path.trim()) {
      throw new Error('Config location path must be provided');
    }

    this.add('--config-locations');
    this.add(path);

    return this;
  }

  /**
   * Path to an additional directory to search for plugins.
   * This option can be used multiple times to add multiple directories.
   * Use "default" to search the default plugin directories (default).
   *
   * @param dir Path to the plugin directory or "default".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  pluginDirs(dir: string = 'default') {
    if (!dir || !dir.trim()) {
      throw new Error('Plugin directory must be provided');
    }

    this.add('--plugin-dirs');
    this.add(dir);

    return this;
  }

  /**
   * Clear plugin directories to search, including defaults and those provided by
   * previous --plugin-dirs.
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noPluginDirs() {
    this.once('noPluginDirs', '--no-plugin-dirs');
    return this;
  }

  /**
   * Additional JavaScript runtime to enable, with an optional location for the runtime
   * (either the path to the binary or its containing directory).
   * This option can be used multiple times to enable multiple runtimes.
   * Supported runtimes are (in order of priority, from highest to lowest):
   * deno, node, quickjs, bun.
   * Only "deno" is enabled by default.
   *
   * @param runtime JavaScript runtime to enable.
   * @param path Optional path to the runtime binary or its containing directory.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  jsRuntime(runtime: JsRuntime, path?: string) {
    if (!runtime) {
      throw new Error('JavaScript runtime must be provided');
    }

    if (path !== undefined && !path.trim()) {
      throw new Error('Runtime path cannot be empty');
    }

    this.add('--js-runtimes');

    const value = path ? `${runtime}:${path}` : runtime;
    this.add(value);

    return this;
  }

  /**
   * Clear JavaScript runtimes to enable,
   * including defaults and those provided by previous --js-runtimes
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noJsRuntimes() {
    this.once('noJsRuntimes', '--no-js-runtimes');
    return this;
  }

  /**
   * Remote components to allow yt-dlp to fetch when required.
   * This option is currently not needed if you are using an official executable
   * or have the requisite version of the yt-dlp-ejs package installed.
   * You can use this option multiple times to allow multiple components.
   *
   * Supported values:
   *  - ejs:npm (external JavaScript components from npm)
   *  - ejs:github (external JavaScript components from yt-dlp-ejs GitHub)
   *
   * @param component Remote component to allow.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  remoteComponent(component: RemoteComponent) {
    if (!component) {
      throw new Error('Remote component must be provided');
    }

    this.add('--remote-components');
    this.add(component);

    return this;
  }

  /**
   * Disallow fetching of all remote components,
   * including any previously allowed by --remote-components or defaults.
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noRemoteComponents() {
    this.once('noRemoteComponents', '--no-remote-components');
    return this;
  }

  /**
   * Do not extract a playlist's URL result entries;
   * some entry metadata may be missing and downloading may be bypassed
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  flatPlaylist() {
    this.once('flatPlaylist', '--flat-playlist');
    return this;
  }

  /**
   * Fully extract the videos of a playlist (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noFlatPlaylist() {
    this.once('noFlatPlaylist', '--no-flat-playlist');
    return this;
  }

  /**
   * Download livestreams from the start.
   * Currently experimental and only supported for YouTube and Twitch
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  liveFromStart() {
    this.once('liveFromStart', '--live-from-start');
    return this;
  }

  /**
   * Download livestreams from the current time (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noLiveFromStart() {
    this.once('noLiveFromStart', '--no-live-from-start');
    return this;
  }

  /**
   * Wait for scheduled streams to become available.
   * Pass the minimum number of seconds (or range) to wait between retries
   *
   * @param wait Seconds to wait, or a range in the form MIN-MAX.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  waitForVideo(wait: number | `${number}-${number}`) {
    if (wait === undefined || wait === null) {
      throw new Error('Wait time must be provided');
    }

    if (typeof wait === 'number') {
      if (!Number.isFinite(wait) || wait < 0) {
        throw new Error('Wait time must be a non-negative number');
      }
    } else {
      const match = /^(\d+)-(\d+)$/.exec(wait);
      if (!match) {
        throw new Error('Wait range must be in the format MIN-MAX');
      }
      const min = Number(match[1]);
      const max = Number(match[2]);
      if (min < 0 || max < 0 || min > max) {
        throw new Error('Invalid wait range: MIN must be <= MAX and both non-negative');
      }
    }

    this.once('waitForVideo', '--wait-for-video');
    this.add(String(wait));

    return this;
  }

  /**
   * Do not wait for scheduled streams (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWaitForVideo() {
    this.once('noWaitForVideo', '--no-wait-for-video');
    return this;
  }

  /**
   * Mark videos watched (even with --simulate)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  markWatched() {
    this.once('markWatched', '--mark-watched');
    return this;
  }

  /**
   * Do not mark videos watched (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noMarkWatched() {
    this.once('noMarkWatched', '--no-mark-watched');
    return this;
  }

  /**
   * Whether to emit color codes in output, optionally prefixed by the STREAM
   * (stdout or stderr) to apply the setting to.
   *
   * POLICY can be one of:
   *  - "always"
   *  - "auto" (default)
   *  - "never"
   *  - "no_color" (use non color terminal sequences)
   *  - "auto-tty" (decide based on terminal support only)
   *  - "no_color-tty" (disable color based on terminal support only)
   *
   * This option can be used multiple times.
   *
   * @param policy Color policy, optionally prefixed with "stdout:" or "stderr:".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  color(
    policy:
      | 'always'
      | 'auto'
      | 'never'
      | 'no_color'
      | 'auto-tty'
      | 'no_color-tty'
      | `stdout:${'always' | 'auto' | 'never' | 'no_color' | 'auto-tty' | 'no_color-tty'}`
      | `stderr:${'always' | 'auto' | 'never' | 'no_color' | 'auto-tty' | 'no_color-tty'}`
  ) {
    if (!policy) {
      throw new Error('Color policy must be provided');
    }

    this.add('--color');
    this.add(policy);

    return this;
  }

  /**
   * Create aliases for an option string.
   * Unless an alias starts with a dash "-", it is prefixed with "--".
   * Arguments are parsed according to the Python string formatting mini-language.
   *
   * Example:
   * --alias get-audio,-X "-S aext:{0},abr -x --audio-format {0}"
   *
   * This creates options "--get-audio" and "-X" that take an argument (ARG0)
   * and expand to "-S aext:ARG0,abr -x --audio-format ARG0".
   *
   * All defined aliases are listed in the --help output.
   * Alias options can trigger more aliases; avoid recursive definitions.
   * As a safety measure, each alias may be triggered a maximum of 100 times.
   *
   * This option can be used multiple times.
   *
   * @param aliases One or more alias names, separated by commas.
   * @param options Expansion string for the alias.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  alias(aliases: string | string[], options: string) {
    if (!aliases || (Array.isArray(aliases) && aliases.length === 0)) {
      throw new Error('At least one alias must be provided');
    }

    if (!options || !options.trim()) {
      throw new Error('Alias options string must be provided');
    }

    const aliasValue = Array.isArray(aliases) ? aliases.join(',') : aliases;

    this.add('--alias');
    this.add(aliasValue);
    this.add(options);

    return this;
  }

  /**
   * Applies a predefined set of options.
   * e.g. --preset-alias mp3
   *
   * The following presets are available:
   *  - mp3
   *  - aac
   *  - mp4
   *  - mkv
   *  - sleep
   *
   * See the "Preset Aliases" section for more info in the yt-dlp README.
   * This option can be used multiple times.
   *
   * @param preset Preset alias to apply.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  presetAlias(preset: 'mp3' | 'aac' | 'mp4' | 'mkv' | 'sleep') {
    if (!preset) {
      throw new Error('Preset alias must be provided');
    }

    this.add('--preset-alias');
    this.add(preset);

    return this;
  }

  /**
   * Use the specified HTTP/HTTPS/SOCKS proxy.
   * To enable SOCKS proxy, specify a proper scheme,
   * e.g. socks5://user:pass@127.0.0.1:1080/.
   * Pass in an empty string (--proxy "") for direct connection
   *
   * @param url Proxy URL, or an empty string to force direct connection.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  proxy(url: string) {
    if (url === undefined || url === null) {
      throw new Error('Proxy value must be provided');
    }

    this.once('proxy', '--proxy');
    this.add(url);

    return this;
  }

  /**
   * Time to wait before giving up, in seconds
   *
   * @param seconds Number of seconds before socket timeout.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  socketTimeout(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error('Socket timeout must be a non-negative number');
    }

    this.once('socketTimeout', '--socket-timeout');
    this.add(String(seconds));

    return this;
  }

  /**
   * Client-side IP address to bind to
   *
   * @param ip IP address to bind the client to.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sourceAddress(ip: string) {
    if (!ip || !ip.trim()) {
      throw new Error('Source address must be provided');
    }

    this.once('sourceAddress', '--source-address');
    this.add(ip);

    return this;
  }

  /**
   * Client to impersonate for requests.
   * E.g. chrome, chrome-110, chrome:windows-10.
   * Pass an empty string (--impersonate "") to impersonate any client.
   *
   * Note that forcing impersonation for all requests may have a detrimental
   * impact on download speed and stability.
   *
   * @param client Client (optionally with OS) to impersonate, or empty string.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  impersonate(client: string) {
    if (client === undefined || client === null) {
      throw new Error('Impersonate value must be provided');
    }

    this.once('impersonate', '--impersonate');
    this.add(client);

    return this;
  }

  /**
   * List available clients to impersonate.
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  listImpersonateTargets() {
    this.once('listImpersonateTargets', '--list-impersonate-targets');
    return this;
  }

  /**
   * Make all connections via IPv4
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  forceIpv4() {
    this.once('forceIpv4', '--force-ipv4');
    return this;
  }

  /**
   * Make all connections via IPv6
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  forceIpv6() {
    this.once('forceIpv6', '--force-ipv6');
    return this;
  }

  /**
   * Enable file:// URLs.
   * This is disabled by default for security reasons.
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  enableFileUrls() {
    this.once('enableFileUrls', '--enable-file-urls');
    return this;
  }

  /**
   * Use this proxy to verify the IP address for some geo-restricted sites.
   * The default proxy specified by --proxy (or none, if the option is not present)
   * is used for the actual downloading.
   *
   * @param url Proxy URL to use for geo verification.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  geoVerificationProxy(url: string) {
    if (url === undefined || url === null) {
      throw new Error('Geo verification proxy value must be provided');
    }

    this.once('geoVerificationProxy', '--geo-verification-proxy');
    this.add(url);

    return this;
  }

  /**
   * How to fake X-Forwarded-For HTTP header to try bypassing geographic restriction.
   *
   * VALUE can be one of:
   *  - "default" (only when known to be useful)
   *  - "never"
   *  - an IP block in CIDR notation
   *  - a two-letter ISO 3166-2 country code
   *
   * @param value X-Forwarded-For value to use.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  xff(value: string) {
    if (!value || !value.trim()) {
      throw new Error('X-Forwarded-For value must be provided');
    }

    this.once('xff', '--xff');
    this.add(value);

    return this;
  }

  /**
   * Comma-separated playlist_index of the items to download.
   * You can specify a range using "[START]:[STOP][:STEP]".
   * For backward compatibility, START-STOP is also supported.
   * Use negative indices to count from the right and negative STEP
   * to download in reverse order.
   *
   * E.g. "-I 1:3,7,-5::2" used on a playlist of size 15 will download
   * the items at index 1, 2, 3, 7, 11, 13, 15.
   *
   * @param itemSpec Comma-separated playlist_index or range specification.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  playlistItems(itemSpec: string) {
    if (!itemSpec || !itemSpec.trim()) {
      throw new Error('Playlist item specification must be provided');
    }

    this.once('playlistItems', '--playlist-items');
    this.add(itemSpec);

    return this;
  }

  /**
   * Abort download if filesize is smaller than SIZE,
   * e.g. 50k or 44.6M
   *
   * @param size Minimum allowed filesize (e.g. "50k", "44.6M").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  minFilesize(size: string) {
    if (!size || !size.trim()) {
      throw new Error('Minimum filesize must be provided');
    }

    this.once('minFilesize', '--min-filesize');
    this.add(size);

    return this;
  }

  /**
   * Abort download if filesize is larger than SIZE,
   * e.g. 50k or 44.6M
   *
   * @param size Maximum allowed filesize (e.g. "50k", "44.6M").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  maxFilesize(size: string) {
    if (!size || !size.trim()) {
      throw new Error('Maximum filesize must be provided');
    }

    this.once('maxFilesize', '--max-filesize');
    this.add(size);

    return this;
  }

  /**
   * Download only videos uploaded on this date.
   * The date can be "YYYYMMDD" or in the format
   * [now|today|yesterday][-N[day|week|month|year]].
   *
   * E.g. "--date today-2weeks" downloads only
   * videos uploaded on the same day two weeks ago.
   *
   * @param date Date filter to apply.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  date(date: string) {
    if (!date || !date.trim()) {
      throw new Error('Date value must be provided');
    }

    this.once('date', '--date');
    this.add(date);

    return this;
  }

  /**
   * Download only videos uploaded on or before this date.
   * The date formats accepted are the same as --date.
   *
   * @param date Date filter to apply.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  dateBefore(date: string) {
    if (!date || !date.trim()) {
      throw new Error('Date value must be provided');
    }

    this.once('dateBefore', '--datebefore');
    this.add(date);

    return this;
  }

  /**
   * Download only videos uploaded on or after this date.
   * The date formats accepted are the same as --date.
   *
   * @param date Date filter to apply.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  dateAfter(date: string) {
    if (!date || !date.trim()) {
      throw new Error('Date value must be provided');
    }

    this.once('dateAfter', '--dateafter');
    this.add(date);

    return this;
  }

  /**
   * Generic video filter. Any "OUTPUT TEMPLATE" field can be compared with a number
   * or a string using the operators defined in "Filtering Formats".
   *
   * You can also simply specify a field to match if the field is present,
   * use "!field" to check if the field is not present, and "&" to check multiple
   * conditions. Use a "\" to escape "&" or quotes if needed.
   *
   * If used multiple times, the filter matches if at least one of the conditions
   * is met.
   *
   * E.g. --match-filters !is_live --match-filters "like_count>?100 &
   * description~='(?i)\bcats \& dogs\b'" matches only videos that are not live
   * OR those that have a like count more than 100 (or the like field is not
   * available) and also has a description that contains the phrase
   * "cats & dogs" (caseless).
   *
   * Use "--match-filters -" to interactively ask whether to download each video.
   *
   * @param filter Filter string.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  matchFilters(filter: string) {
    if (!filter || !filter.trim()) {
      throw new Error('Match filter must be provided');
    }

    this.add('--match-filters');
    this.add(filter);

    return this;
  }

  /**
   * Do not use any --match-filters (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noMatchFilters() {
    this.once('noMatchFilters', '--no-match-filters');
    return this;
  }

  /**
   * Same as "--match-filters" but stops the download process
   * when a video is rejected.
   *
   * @param filter Filter string.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  breakMatchFilters(filter: string) {
    if (!filter || !filter.trim()) {
      throw new Error('Break match filter must be provided');
    }

    this.add('--break-match-filters');
    this.add(filter);

    return this;
  }

  /**
   * Do not use any --break-match-filters (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noBreakMatchFilters() {
    this.once('noBreakMatchFilters', '--no-break-match-filters');
    return this;
  }

  /**
   * Download only the video, if the URL refers
   * to a video and a playlist
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noPlaylist() {
    this.once('noPlaylist', '--no-playlist');
    return this;
  }

  /**
   * Download the playlist, if the URL refers to
   * a video and a playlist
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  yesPlaylist() {
    this.once('yesPlaylist', '--yes-playlist');
    return this;
  }

  /**
   * Download only videos suitable for the given
   * age
   *
   * @param years Age limit in years.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  ageLimit(years: number) {
    if (!Number.isFinite(years) || years < 0) {
      throw new Error('Age limit must be a non-negative number');
    }

    this.once('ageLimit', '--age-limit');
    this.add(String(years));

    return this;
  }

  /**
   * Download only videos not listed in the archive file.
   * Record the IDs of all downloaded videos in it.
   *
   * @param file Path to the download archive file.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  downloadArchive(file: string) {
    if (!file || !file.trim()) {
      throw new Error('Download archive file path must be provided');
    }

    this.once('downloadArchive', '--download-archive');
    this.add(file);

    return this;
  }

  /**
   * Do not use archive file (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noDownloadArchive() {
    this.once('noDownloadArchive', '--no-download-archive');
    return this;
  }

  /**
   * Abort after downloading NUMBER files
   *
   * @param number Maximum number of files to download.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  maxDownloads(number: number) {
    if (!Number.isFinite(number) || number < 0) {
      throw new Error('Max downloads must be a non-negative number');
    }

    this.once('maxDownloads', '--max-downloads');
    this.add(String(number));

    return this;
  }

  /**
   * Stop the download process when encountering
   * a file that is in the archive supplied with
   * the --download-archive option
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  breakOnExisting() {
    this.once('breakOnExisting', '--break-on-existing');
    return this;
  }

  /**
   * Do not stop the download process when
   * encountering a file that is in the archive
   * (default)
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noBreakOnExisting() {
    this.once('noBreakOnExisting', '--no-break-on-existing');
    return this;
  }

  /**
   * Alters --max-downloads, --break-on-existing,
   * --break-match-filters, and autonumber to
   * reset per input URL
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  breakPerInput() {
    this.once('breakPerInput', '--break-per-input');
    return this;
  }

  /**
   * --break-on-existing and similar options
   * terminates the entire download queue
   *
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noBreakPerInput() {
    this.once('noBreakPerInput', '--no-break-per-input');
    return this;
  }

  /**
   * Number of allowed failures until the rest of
   * the playlist is skipped
   *
   * @param count Number of allowed failures.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  skipPlaylistAfterErrors(count: number) {
    if (!Number.isFinite(count) || count < 0) {
      throw new Error('Skip-playlist-after-errors value must be a non-negative number');
    }

    this.once('skipPlaylistAfterErrors', '--skip-playlist-after-errors');
    this.add(String(count));

    return this;
  }

  /**
   * Number of fragments of a dash/hlsnative video that should be downloaded concurrently (default is 1)
   * @param n Number of fragments.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  concurrentFragments(n: number = 1) {
    if (!Number.isInteger(n) || n < 1) {
      throw new Error('Concurrent fragments must be a positive integer');
    }
    this.once('concurrentFragments', '--concurrent-fragments');
    this.add(String(n));
    return this;
  }

  /**
   * Maximum download rate in bytes per second, e.g. 50K or 4.2M
   * @param rate Maximum download rate (e.g., "50K", "4.2M").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  limitRate(rate: string) {
    if (!rate || !rate.trim()) {
      throw new Error('Limit rate must be provided');
    }
    this.once('limitRate', '--limit-rate');
    this.add(rate);
    return this;
  }

  /**
   * Minimum download rate in bytes per second below which throttling is assumed and the video data is re-extracted, e.g. 100K
   * @param rate Throttled rate threshold (e.g., "100K").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  throttledRate(rate: string) {
    if (!rate || !rate.trim()) {
      throw new Error('Throttled rate must be provided');
    }
    this.once('throttledRate', '--throttled-rate');
    this.add(rate);
    return this;
  }

  /**
   * Number of retries (default is 10), or "infinite"
   * @param retries Number of retries or "infinite".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  retries(retries: number | 'infinite' = 10) {
    if (typeof retries === 'number') {
      if (!Number.isFinite(retries) || retries < 0) {
        throw new Error('Retries must be a non-negative number');
      }
    } else if (retries !== 'infinite') {
      throw new Error('Retries must be a number or "infinite"');
    }

    this.once('retries', '--retries');
    this.add(String(retries));
    return this;
  }

  /**
   * Number of times to retry on file access error (default is 3), or "infinite"
   * @param retries Number of retries or "infinite".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  fileAccessRetries(retries: number | 'infinite' = 3) {
    if (typeof retries === 'number') {
      if (!Number.isInteger(retries) || retries < 0) {
        throw new Error('File access retries must be a non-negative integer');
      }
    } else if (retries !== 'infinite') {
      throw new Error('File access retries must be a number or "infinite"');
    }

    this.once('fileAccessRetries', '--file-access-retries');
    this.add(String(retries));
    return this;
  }

  /**
   * Number of retries for a fragment (default is 10), or "infinite" (DASH, hlsnative and ISM)
   * @param retries Number of retries or "infinite".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  fragmentRetries(retries: number | 'infinite' = 10) {
    if (typeof retries === 'number') {
      if (!Number.isInteger(retries) || retries < 0) {
        throw new Error('Fragment retries must be a non-negative integer');
      }
    } else if (retries !== 'infinite') {
      throw new Error('Fragment retries must be a number or "infinite"');
    }

    this.once('fragmentRetries', '--fragment-retries');
    this.add(String(retries));
    return this;
  }

  /**
   * Time to sleep between retries in seconds (optionally) prefixed by the type of retry
   * (http (default), fragment, file_access, extractor) to apply the sleep to.
   * EXPR can be a number, linear=START[:END[:STEP=1]] or exp=START[:END[:BASE=2]].
   * This option can be used multiple times to set the sleep for the different retry types,
   * e.g. --retry-sleep linear=1::2 --retry-sleep fragment:exp=1:20
   *
   * @param expr The sleep expression (e.g., 5, "linear=1::2", "exp=1:20").
   * @param type Optional retry type to apply the sleep to.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  retrySleep(expr: number | string, type?: RetryType) {
    if (expr === undefined || expr === null || (typeof expr === 'string' && !expr.trim())) {
      throw new Error('Retry sleep expression must be provided');
    }

    const value = type ? `${type}:${expr}` : String(expr);

    this.add('--retry-sleep');
    this.add(value);

    return this;
  }

  /**
   * Skip unavailable fragments for DASH, hlsnative and ISM downloads (default) (Alias: --no-abort-on-unavailable-fragments)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  skipUnavailableFragments() {
    this.once('skipUnavailableFragments', '--skip-unavailable-fragments');
    return this;
  }

  /**
   * Abort download if a fragment is unavailable (Alias: --no-skip-unavailable-fragments)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  abortOnUnavailableFragments() {
    this.once('abortOnUnavailableFragments', '--abort-on-unavailable-fragments');
    return this;
  }

  /**
   * Keep downloaded fragments on disk after downloading is finished
   * @returns The current instance of YtdlpCommandBuilder.
   */
  keepFragments() {
    this.once('keepFragments', '--keep-fragments');
    return this;
  }

  /**
   * Delete downloaded fragments after downloading is finished (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noKeepFragments() {
    this.once('noKeepFragments', '--no-keep-fragments');
    return this;
  }

  /**
   * Size of download buffer, e.g. 1024 or 16K (default is 1024)
   * @param size Size of the buffer (e.g., 1024, "16K").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  bufferSize(size: number | string) {
    if (size === undefined || size === null || (typeof size === 'string' && !size.trim())) {
      throw new Error('Buffer size must be provided');
    }
    this.once('bufferSize', '--buffer-size');
    this.add(String(size));
    return this;
  }

  /**
   * The buffer size is automatically resized from an initial value of --buffer-size (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  resizeBuffer() {
    this.once('resizeBuffer', '--resize-buffer');
    return this;
  }

  /**
   * Do not automatically adjust the buffer size
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noResizeBuffer() {
    this.once('noResizeBuffer', '--no-resize-buffer');
    return this;
  }

  /**
   * Size of a chunk for chunk-based HTTP downloading, e.g. 10485760 or 10M (default is disabled).
   * May be useful for bypassing bandwidth throttling imposed by a webserver (experimental)
   * @param size Size of the chunk (e.g., 10485760, "10M").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  httpChunkSize(size: number | string) {
    if (size === undefined || size === null || (typeof size === 'string' && !size.trim())) {
      throw new Error('HTTP chunk size must be provided');
    }
    this.once('httpChunkSize', '--http-chunk-size');
    this.add(String(size));
    return this;
  }

  /**
   * Download playlist videos in random order
   * @returns The current instance of YtdlpCommandBuilder.
   */
  playlistRandom() {
    this.once('playlistRandom', '--playlist-random');
    return this;
  }

  /**
   * Process entries in the playlist as they are received. This disables n_entries, --playlist-random and --playlist-reverse
   * @returns The current instance of YtdlpCommandBuilder.
   */
  lazyPlaylist() {
    this.once('lazyPlaylist', '--lazy-playlist');
    return this;
  }

  /**
   * Process videos in the playlist only after the entire playlist is parsed (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noLazyPlaylist() {
    this.once('noLazyPlaylist', '--no-lazy-playlist');
    return this;
  }

  /**
   * Use the mpegts container for HLS videos; allowing some players to play the video while downloading,
   * and reducing the chance of file corruption if download is interrupted. This is enabled by default for live streams
   * @returns The current instance of YtdlpCommandBuilder.
   */
  hlsUseMpegts() {
    this.once('hlsUseMpegts', '--hls-use-mpegts');
    return this;
  }

  /**
   * Do not use the mpegts container for HLS videos. This is default when not downloading live streams
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noHlsUseMpegts() {
    this.once('noHlsUseMpegts', '--no-hls-use-mpegts');
    return this;
  }

  /**
   * Download only chapters that match the regular expression. A "*" prefix denotes
   * time-range instead of chapter. Negative timestamps are calculated from the end.
   * "*from-url" can be used to download between the "start_time" and "end_time"
   * extracted from the URL. Needs ffmpeg. This option can be used multiple times
   * to download multiple sections, e.g. --download-sections "*10:15-inf"
   * --download-sections "intro"
   *
   * @param regex The regular expression for chapters or a time-range prefixed with "*".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  downloadSections(regex: string) {
    if (!regex || !regex.trim()) {
      throw new Error('Download section regex/range must be provided');
    }
    this.add('--download-sections');
    this.add(regex);
    return this;
  }

  /**
   * Name or path of the external downloader to use (optionally) prefixed by the
   * protocols (http, ftp, m3u8, dash, rstp, rtmp, mms) to use it for.
   * Currently supports native, aria2c, axel, curl, ffmpeg, httpie, wget.
   * You can use this option multiple times to set different downloaders for different protocols.
   * E.g. --downloader aria2c --downloader "dash,m3u8:native" will use aria2c for http/ftp
   * downloads, and the native downloader for dash/m3u8 downloads (Alias: --external-downloader)
   *
   * @param name Name of the downloader or path to its binary.
   * @param protocols Optional protocols to apply this downloader to.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  downloader(name: DownloaderName | string, protocols?: DownloaderProtocol | DownloaderProtocol[]) {
    if (!name || !name.trim()) {
      throw new Error('Downloader name/path must be provided');
    }

    let value = name;
    if (protocols) {
      const protoStr = Array.isArray(protocols) ? protocols.join(',') : protocols;
      value = `${protoStr}:${name}`;
    }

    this.add('--downloader');
    this.add(value);
    return this;
  }

  /**
   * Give these arguments to the external downloader. Specify the downloader name
   * and the arguments separated by a colon ":". For ffmpeg, arguments can be
   * passed to different positions using the same syntax as --postprocessor-args.
   * You can use this option multiple times to give different arguments to
   * different downloaders (Alias: --external-downloader-args)
   *
   * @param name Downloader name (e.g., "aria2c", "ffmpeg").
   * @param args Arguments string to pass to the downloader.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  downloaderArgs(name: DownloaderName | string, args: string) {
    if (!name || !name.trim()) {
      throw new Error('Downloader name must be provided');
    }
    if (!args || !args.trim()) {
      throw new Error('Downloader arguments must be provided');
    }

    this.add('--downloader-args');
    this.add(`${name}:${args}`);
    return this;
  }

  /**
   * File containing URLs to download ("-" for stdin), one URL per line.
   * Lines starting with "#", ";" or "]" are considered as comments and ignored
   * @param file Path to the batch file or "-" for stdin.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  batchFile(file: string) {
    if (!file || !file.trim()) {
      throw new Error('Batch file path must be provided');
    }
    this.once('batchFile', '--batch-file');
    this.add(file);
    return this;
  }

  /**
   * Do not read URLs from batch file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noBatchFile() {
    this.once('noBatchFile', '--no-batch-file');
    return this;
  }

  /**
   * The paths where the files should be downloaded. Specify the type of file
   * and the path separated by a colon ":". All the same TYPES as --output are supported.
   * Additionally, you can also provide "home" (default) and "temp" paths.
   * All intermediary files are first downloaded to the temp path and then the final
   * files are moved over to the home path after download is finished.
   * This option is ignored if --output is an absolute path.
   *
   * @param path The filesystem path.
   * @param type Optional type of file (e.g., "home", "temp", "subtitle").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  paths(path: string, type?: PathType) {
    if (!path || !path.trim()) {
      throw new Error('Path must be provided');
    }

    const value = type ? `${type}:${path}` : path;
    this.add('--paths');
    this.add(value);
    return this;
  }

  /**
   * Output filename template; see "OUTPUT TEMPLATE" for details in the yt-dlp README.
   * @param template The template string (e.g., "%(title)s.%(ext)s").
   * @param type Optional type of file (e.g., "subtitle", "thumbnail").
   * @returns The current instance of YtdlpCommandBuilder.
   */
  output(template: string, type?: PathType) {
    if (!template || !template.trim()) {
      throw new Error('Output template must be provided');
    }

    const value = type ? `${type}:${template}` : template;
    this.add('--output');
    this.add(value);
    return this;
  }

  /**
   * Placeholder for unavailable fields in --output (default: "NA")
   * @param text The text to use as a placeholder.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  outputNaPlaceholder(text: string = 'NA') {
    if (text === undefined || text === null) {
      throw new Error('Placeholder text must be provided');
    }
    this.once('outputNaPlaceholder', '--output-na-placeholder');
    this.add(text);
    return this;
  }

  /**
   * Restrict filenames to only ASCII characters, and avoid "&" and spaces in filenames
   * @returns The current instance of YtdlpCommandBuilder.
   */
  restrictFilenames() {
    this.once('restrictFilenames', '--restrict-filenames');
    return this;
  }

  /**
   * Allow Unicode characters, "&" and spaces in filenames (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noRestrictFilenames() {
    this.once('noRestrictFilenames', '--no-restrict-filenames');
    return this;
  }

  /**
   * Force filenames to be Windows-compatible
   * @returns The current instance of YtdlpCommandBuilder.
   */
  windowsFilenames() {
    this.once('windowsFilenames', '--windows-filenames');
    return this;
  }

  /**
   * Sanitize filenames only minimally
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWindowsFilenames() {
    this.once('noWindowsFilenames', '--no-windows-filenames');
    return this;
  }

  /**
   * Limit the filename length (excluding extension) to the specified number of characters
   * @param length Maximum number of characters.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  trimFilenames(length: number) {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error('Trim length must be a positive integer');
    }
    this.once('trimFilenames', '--trim-filenames');
    this.add(String(length));
    return this;
  }

  /**
   * Do not overwrite any files
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noOverwrites() {
    this.once('noOverwrites', '--no-overwrites');
    return this;
  }

  /**
   * Overwrite all video and metadata files. This option includes --no-continue
   * @returns The current instance of YtdlpCommandBuilder.
   */
  forceOverwrites() {
    this.once('forceOverwrites', '--force-overwrites');
    return this;
  }

  /**
   * Do not overwrite the video, but overwrite related files (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noForceOverwrites() {
    this.once('noForceOverwrites', '--no-force-overwrites');
    return this;
  }

  /**
   * Resume partially downloaded files/fragments (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  continue() {
    this.once('continue', '--continue');
    return this;
  }

  /**
   * Do not resume partially downloaded fragments. If the file is not fragmented, restart download of the entire file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noContinue() {
    this.once('noContinue', '--no-continue');
    return this;
  }

  /**
   * Use .part files instead of writing directly into output file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  part() {
    this.once('part', '--part');
    return this;
  }

  /**
   * Do not use .part files - write directly into output file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noPart() {
    this.once('noPart', '--no-part');
    return this;
  }

  /**
   * Use the Last-modified header to set the file modification time
   * @returns The current instance of YtdlpCommandBuilder.
   */
  mtime() {
    this.once('mtime', '--mtime');
    return this;
  }

  /**
   * Do not use the Last-modified header to set the file modification time (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noMtime() {
    this.once('noMtime', '--no-mtime');
    return this;
  }

  /**
   * Write video description to a .description file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeDescription() {
    this.once('writeDescription', '--write-description');
    return this;
  }

  /**
   * Do not write video description (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWriteDescription() {
    this.once('noWriteDescription', '--no-write-description');
    return this;
  }

  /**
   * Write video metadata to a .info.json file (this may contain personal information)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeInfoJson() {
    this.once('writeInfoJson', '--write-info-json');
    return this;
  }

  /**
   * Do not write video metadata (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWriteInfoJson() {
    this.once('noWriteInfoJson', '--no-write-info-json');
    return this;
  }

  /**
   * Write playlist metadata in addition to the video metadata when using --write-info-json, --write-description etc. (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writePlaylistMetafiles() {
    this.once('writePlaylistMetafiles', '--write-playlist-metafiles');
    return this;
  }

  /**
   * Do not write playlist metadata when using --write-info-json, --write-description etc.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWritePlaylistMetafiles() {
    this.once('noWritePlaylistMetafiles', '--no-write-playlist-metafiles');
    return this;
  }

  /**
   * Remove some internal metadata such as filenames from the infojson (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  cleanInfoJson() {
    this.once('cleanInfoJson', '--clean-info-json');
    return this;
  }

  /**
   * Write all fields to the infojson
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noCleanInfoJson() {
    this.once('noCleanInfoJson', '--no-clean-info-json');
    return this;
  }

  /**
   * Retrieve video comments to be placed in the infojson.
   * The comments are fetched even without this option if the extraction is known to be quick (Alias: --get-comments)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeComments() {
    this.once('writeComments', '--write-comments');
    return this;
  }

  /**
   * Do not retrieve video comments unless the extraction is known to be quick (Alias: --no-get-comments)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWriteComments() {
    this.once('noWriteComments', '--no-write-comments');
    return this;
  }

  /**
   * JSON file containing the video information (created with the "--write-info-json" option)
   * @param file Path to the info.json file.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  loadInfoJson(file: string) {
    if (!file || !file.trim()) {
      throw new Error('Info JSON file path must be provided');
    }
    this.once('loadInfoJson', '--load-info-json');
    this.add(file);
    return this;
  }

  /**
   * Netscape formatted file to read cookies from and dump cookie jar in
   * @param file Path to the cookies file.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  cookies(file: string) {
    if (!file || !file.trim()) {
      throw new Error('Cookies file path must be provided');
    }
    this.once('cookies', '--cookies');
    this.add(file);
    return this;
  }

  /**
   * Do not read/dump cookies from/to file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noCookies() {
    this.once('noCookies', '--no-cookies');
    return this;
  }

  /**
   * The name of the browser to load cookies from. Optionally, the KEYRING used for
   * decrypting Chromium cookies on Linux, the name/path of the PROFILE to load
   * cookies from, and the CONTAINER name (if Firefox) ("none" for no container)
   * can be given with their respective separators. By default, all containers
   * of the most recently accessed profile are used.
   *
   * @param browser The browser name (e.g., "chrome", "firefox").
   * @param options Optional configuration for keyring, profile, and container.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  cookiesFromBrowser(
    browser: SupportedCookieBrowser,
    options?: {
      keyring?: Keyring;
      profile?: string;
      container?: string;
    }
  ) {
    if (!browser) {
      throw new Error('Browser name must be provided');
    }

    let value: string = browser;

    if (options?.keyring) {
      value += `+${options.keyring}`;
    }

    if (options?.profile) {
      value += `:${options.profile}`;
    }

    if (options?.container) {
      value += `::${options.container}`;
    }

    this.once('cookiesFromBrowser', '--cookies-from-browser');
    this.add(value);
    return this;
  }

  /**
   * Do not load cookies from browser (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noCookiesFromBrowser() {
    this.once('noCookiesFromBrowser', '--no-cookies-from-browser');
    return this;
  }

  /**
   * Location in the filesystem where yt-dlp can store some downloaded information
   * (such as client ids and signatures) permanently. By default ${XDG_CACHE_HOME}/yt-dlp
   * @param dir Directory path for cache.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  cacheDir(dir: string) {
    if (!dir || !dir.trim()) {
      throw new Error('Cache directory path must be provided');
    }
    this.once('cacheDir', '--cache-dir');
    this.add(dir);
    return this;
  }

  /**
   * Disable filesystem caching
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noCacheDir() {
    this.once('noCacheDir', '--no-cache-dir');
    return this;
  }

  /**
   * Delete all filesystem cache files
   * @returns The current instance of YtdlpCommandBuilder.
   */
  rmCacheDir() {
    this.once('rmCacheDir', '--rm-cache-dir');
    return this;
  }

  /**
   * Write thumbnail image to disk
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeThumbnail() {
    this.once('writeThumbnail', '--write-thumbnail');
    return this;
  }

  /**
   * Do not write thumbnail image to disk (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWriteThumbnail() {
    this.once('noWriteThumbnail', '--no-write-thumbnail');
    return this;
  }

  /**
   * Write all thumbnail image formats to disk
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeAllThumbnails() {
    this.once('writeAllThumbnails', '--write-all-thumbnails');
    return this;
  }

  /**
   * List available thumbnails of each video. Simulate unless --no-simulate is used
   * @returns The current instance of YtdlpCommandBuilder.
   */
  listThumbnails() {
    this.once('listThumbnails', '--list-thumbnails');
    return this;
  }

  /**
   * Write an internet shortcut file, depending on the current platform (.url, .webloc or .desktop).
   * The URL may be cached by the OS
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeLink() {
    this.once('writeLink', '--write-link');
    return this;
  }

  /**
   * Write a .url Windows internet shortcut. The OS caches the URL based on the file path
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeUrlLink() {
    this.once('writeUrlLink', '--write-url-link');
    return this;
  }

  /**
   * Write a .webloc macOS internet shortcut
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeWeblocLink() {
    this.once('writeWeblocLink', '--write-webloc-link');
    return this;
  }

  /**
   * Write a .desktop Linux internet shortcut
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeDesktopLink() {
    this.once('writeDesktopLink', '--write-desktop-link');
    return this;
  }

  /**
   * Activate quiet mode. If used with --verbose, print the log to stderr
   * @returns The current instance of YtdlpCommandBuilder.
   */
  quiet() {
    this.once('quiet', '--quiet');
    return this;
  }

  /**
   * Deactivate quiet mode. (Default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noQuiet() {
    this.once('noQuiet', '--no-quiet');
    return this;
  }

  /**
   * Ignore warnings
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWarnings() {
    this.once('noWarnings', '--no-warnings');
    return this;
  }

  /**
   * Do not download the video and do not write anything to disk
   * @returns The current instance of YtdlpCommandBuilder.
   */
  simulate() {
    this.once('simulate', '--simulate');
    return this;
  }

  /**
   * Download the video even if printing/listing options are used
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noSimulate() {
    this.once('noSimulate', '--no-simulate');
    return this;
  }

  /**
   * Ignore "No video formats" error. Useful for extracting metadata even if the videos are not actually available for download (experimental)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  ignoreNoFormatsError() {
    this.once('ignoreNoFormatsError', '--ignore-no-formats-error');
    return this;
  }

  /**
   * Throw error when no downloadable video formats are found (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noIgnoreNoFormatsError() {
    this.once('noIgnoreNoFormatsError', '--no-ignore-no-formats-error');
    return this;
  }

  /**
   * Do not download the video but write all related files (Alias: --no-download)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  skipDownload() {
    this.once('skipDownload', '--skip-download');
    return this;
  }

  /**
   * Field name or output template to print to screen, optionally prefixed with when to print it, separated by a ":". Supported values of "WHEN" are the same as that of --use-postprocessor (default: video). Implies --quiet. Implies --simulate unless --no-simulate or later stages of WHEN are used. This option can be used multiple times
   * @param template Field name or output template.
   * @param when Optional prefix defining when to print it.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  print(template: string, when?: PrintWhen) {
    if (!template || !template.trim()) {
      throw new Error('Print template must be provided');
    }
    const value = when ? `${when}:${template}` : template;
    this.add('--print');
    this.add(value);
    return this;
  }

  /**
   * Append given template to the file. The values of WHEN and TEMPLATE are the same as that of --print. FILE uses the same syntax as the output template. This option can be used multiple times
   * @param template Field name or output template.
   * @param file The file path to append to.
   * @param when Optional prefix defining when to print it.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  printToFile(template: string, file: string, when?: PrintWhen) {
    if (!template || !template.trim()) {
      throw new Error('Print template must be provided');
    }
    if (!file || !file.trim()) {
      throw new Error('File path must be provided');
    }
    const value = when ? `${when}:${template}` : template;
    this.add('--print-to-file');
    this.add(value);
    this.add(file);
    return this;
  }

  /**
   * Quiet, but print JSON information for each video. Simulate unless --no-simulate is used. See "OUTPUT TEMPLATE" for a description of available keys in the yt-dlp README.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  dumpJson() {
    this.once('dumpJson', '--dump-json');
    return this;
  }

  /**
   * Quiet, but print JSON information for each URL or infojson passed. Simulate unless --no-simulate is used. If the URL refers to a playlist, the whole playlist information is dumped in a single line
   * @returns The current instance of YtdlpCommandBuilder.
   */
  dumpSingleJson() {
    this.once('dumpSingleJson', '--dump-single-json');
    return this;
  }

  /**
   * Force download archive entries to be written as far as no errors occur, even if -s or another simulation option is used (Alias: --force-download-archive)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  forceWriteArchive() {
    this.once('forceWriteArchive', '--force-write-archive');
    return this;
  }

  /**
   * Output progress bar as new lines
   * @returns The current instance of YtdlpCommandBuilder.
   */
  newline() {
    this.once('newline', '--newline');
    return this;
  }

  /**
   * Do not print progress bar
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noProgress() {
    this.once('noProgress', '--no-progress');
    return this;
  }

  /**
   * Show progress bar, even if in quiet mode
   * @returns The current instance of YtdlpCommandBuilder.
   */
  progress() {
    this.once('progress', '--progress');
    return this;
  }

  /**
   * Display progress in console titlebar
   * @returns The current instance of YtdlpCommandBuilder.
   */
  consoleTitle() {
    this.once('consoleTitle', '--console-title');
    return this;
  }

  /**
   * Template for progress outputs, optionally prefixed with one of "download:" (default), "download-title:" (the console title), "postprocess:", or "postprocess-title:". The video's fields are accessible under the "info" key and the progress attributes are accessible under "progress" key. E.g. --console-title --progress-template "download-title:%(info.id)s-%(progress.eta)s"
   * @param template Template for progress outputs.
   * @param type Optional prefix type.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  progressTemplate(template: string, type?: ProgressTemplateType) {
    if (!template || !template.trim()) {
      throw new Error('Progress template must be provided');
    }
    const value = type ? `${type}:${template}` : template;
    this.add('--progress-template');
    this.add(value);
    return this;
  }

  /**
   * Time between progress output (default: 0)
   * @param seconds Number of seconds.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  progressDelta(seconds: number = 0) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error('Progress delta must be a non-negative number');
    }
    this.once('progressDelta', '--progress-delta');
    this.add(String(seconds));
    return this;
  }

  /**
   * Print various debugging information
   * @returns The current instance of YtdlpCommandBuilder.
   */
  verbose() {
    this.once('verbose', '--verbose');
    return this;
  }

  /**
   * Print downloaded pages encoded using base64 to debug problems (very verbose)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  dumpPages() {
    this.once('dumpPages', '--dump-pages');
    return this;
  }

  /**
   * Write downloaded intermediary pages to files in the current directory to debug problems
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writePages() {
    this.once('writePages', '--write-pages');
    return this;
  }

  /**
   * Display sent and read HTTP traffic
   * @returns The current instance of YtdlpCommandBuilder.
   */
  printTraffic() {
    this.once('printTraffic', '--print-traffic');
    return this;
  }

  /**
   * Force the specified encoding (experimental)
   * @param encoding The encoding to force.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  encoding(encoding: string) {
    if (!encoding || !encoding.trim()) {
      throw new Error('Encoding must be provided');
    }
    this.once('encoding', '--encoding');
    this.add(encoding);
    return this;
  }

  /**
   * Explicitly allow HTTPS connection to servers that do not support RFC 5746 secure renegotiation
   * @returns The current instance of YtdlpCommandBuilder.
   */
  legacyServerConnect() {
    this.once('legacyServerConnect', '--legacy-server-connect');
    return this;
  }

  /**
   * Suppress HTTPS certificate validation
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noCheckCertificates() {
    this.once('noCheckCertificates', '--no-check-certificates');
    return this;
  }

  /**
   * Use an unencrypted connection to retrieve information about the video (Currently supported only for YouTube)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  preferInsecure() {
    this.once('preferInsecure', '--prefer-insecure');
    return this;
  }

  /**
   * Specify a custom HTTP header and its value, separated by a colon ":". You can use this option multiple times
   * @param field The HTTP header field name.
   * @param value The HTTP header value.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  addHeaders(field: string, value: string) {
    if (!field || !field.trim()) {
      throw new Error('Header field must be provided');
    }
    if (!value || !value.trim()) {
      throw new Error('Header value must be provided');
    }
    this.add('--add-headers');
    this.add(`${field}:${value}`);
    return this;
  }

  /**
   * Work around terminals that lack bidirectional text support. Requires bidiv or fribidi executable in PATH
   * @returns The current instance of YtdlpCommandBuilder.
   */
  bidiWorkaround() {
    this.once('bidiWorkaround', '--bidi-workaround');
    return this;
  }

  /**
   * Number of seconds to sleep between requests during data extraction
   * @param seconds Number of seconds to sleep.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sleepRequests(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error('Sleep requests seconds must be a non-negative number');
    }
    this.once('sleepRequests', '--sleep-requests');
    this.add(String(seconds));
    return this;
  }

  /**
   * Number of seconds to sleep before each download. This is the minimum time to sleep when used along with --max-sleep-interval (Alias: --min-sleep-interval)
   * @param seconds Number of seconds to sleep.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sleepInterval(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error('Sleep interval seconds must be a non-negative number');
    }
    this.once('sleepInterval', '--sleep-interval');
    this.add(String(seconds));
    return this;
  }

  /**
   * Maximum number of seconds to sleep. Can only be used along with --min-sleep-interval
   * @param seconds Maximum number of seconds to sleep.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  maxSleepInterval(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error('Max sleep interval seconds must be a non-negative number');
    }
    this.once('maxSleepInterval', '--max-sleep-interval');
    this.add(String(seconds));
    return this;
  }

  /**
   * Number of seconds to sleep before each subtitle download
   * @param seconds Number of seconds to sleep.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sleepSubtitles(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error('Sleep subtitles seconds must be a non-negative number');
    }
    this.once('sleepSubtitles', '--sleep-subtitles');
    this.add(String(seconds));
    return this;
  }

  /**
   * Video format code, see "FORMAT SELECTION" for more details in the yt-dlp README.
   * @param format Video format code.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  format(format: string) {
    if (!format || !format.trim()) {
      throw new Error('Format must be provided');
    }
    this.once('format', '--format');
    this.add(format);
    return this;
  }

  /**
   * Sort the formats by the fields given, see "Sorting Formats" for more details in the yt-dlp README.
   * @param sortOrder Sort order string.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  formatSort(sortOrder: string) {
    if (!sortOrder || !sortOrder.trim()) {
      throw new Error('Sort order must be provided');
    }
    this.once('formatSort', '--format-sort');
    this.add(sortOrder);
    return this;
  }

  /**
   * Force user specified sort order to have precedence over all fields, see "Sorting Formats" for more details in the yt-dlp README. (Alias: --S-force)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  formatSortForce() {
    this.once('formatSortForce', '--format-sort-force');
    return this;
  }

  /**
   * Some fields have precedence over the user specified sort order (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noFormatSortForce() {
    this.once('noFormatSortForce', '--no-format-sort-force');
    return this;
  }

  /**
   * Allow multiple video streams to be merged into a single file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  videoMultistreams() {
    this.once('videoMultistreams', '--video-multistreams');
    return this;
  }

  /**
   * Only one video stream is downloaded for each output file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noVideoMultistreams() {
    this.once('noVideoMultistreams', '--no-video-multistreams');
    return this;
  }

  /**
   * Allow multiple audio streams to be merged into a single file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  audioMultistreams() {
    this.once('audioMultistreams', '--audio-multistreams');
    return this;
  }

  /**
   * Only one audio stream is downloaded for each output file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noAudioMultistreams() {
    this.once('noAudioMultistreams', '--no-audio-multistreams');
    return this;
  }

  /**
   * Prefer video formats with free containers over non-free ones of the same quality. Use with "-S ext" to strictly prefer free containers irrespective of quality
   * @returns The current instance of YtdlpCommandBuilder.
   */
  preferFreeFormats() {
    this.once('preferFreeFormats', '--prefer-free-formats');
    return this;
  }

  /**
   * Don't give any special preference to free containers (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noPreferFreeFormats() {
    this.once('noPreferFreeFormats', '--no-prefer-free-formats');
    return this;
  }

  /**
   * Make sure formats are selected only from those that are actually downloadable
   * @returns The current instance of YtdlpCommandBuilder.
   */
  checkFormats() {
    this.once('checkFormats', '--check-formats');
    return this;
  }

  /**
   * Check all formats for whether they are actually downloadable
   * @returns The current instance of YtdlpCommandBuilder.
   */
  checkAllFormats() {
    this.once('checkAllFormats', '--check-all-formats');
    return this;
  }

  /**
   * Do not check that the formats are actually downloadable
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noCheckFormats() {
    this.once('noCheckFormats', '--no-check-formats');
    return this;
  }

  /**
   * List available formats of each video. Simulate unless --no-simulate is used
   * @returns The current instance of YtdlpCommandBuilder.
   */
  listFormats() {
    this.once('listFormats', '--list-formats');
    return this;
  }

  /**
   * Containers that may be used when merging formats, separated by "/", e.g. "mp4/mkv". Ignored if no merge is required. (currently supported: avi, flv, mkv, mov, mp4, webm)
   * @param format Container format(s) separated by "/".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  mergeOutputFormat(format: string) {
    if (!format || !format.trim()) {
      throw new Error('Merge output format must be provided');
    }
    this.once('mergeOutputFormat', '--merge-output-format');
    this.add(format);
    return this;
  }

  /**
   * Write subtitle file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeSubs() {
    this.once('writeSubs', '--write-subs');
    return this;
  }

  /**
   * Do not write subtitle file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWriteSubs() {
    this.once('noWriteSubs', '--no-write-subs');
    return this;
  }

  /**
   * Write automatically generated subtitle file (Alias: --write-automatic-subs)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  writeAutoSubs() {
    this.once('writeAutoSubs', '--write-auto-subs');
    return this;
  }

  /**
   * Do not write auto-generated subtitles (default) (Alias: --no-write-automatic-subs)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noWriteAutoSubs() {
    this.once('noWriteAutoSubs', '--no-write-auto-subs');
    return this;
  }

  /**
   * List available subtitles of each video. Simulate unless --no-simulate is used
   * @returns The current instance of YtdlpCommandBuilder.
   */
  listSubs() {
    this.once('listSubs', '--list-subs');
    return this;
  }

  /**
   * Subtitle format; accepts formats preference separated by "/", e.g. "srt" or "ass/srt/best"
   * @param format Subtitle format preference.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  subFormat(format: string) {
    if (!format || !format.trim()) {
      throw new Error('Subtitle format must be provided');
    }
    this.once('subFormat', '--sub-format');
    this.add(format);
    return this;
  }

  /**
   * Languages of the subtitles to download (can be regex) or "all" separated by commas, e.g. --sub-langs "en.*,ja" (where "en.*" is a regex pattern that matches "en" followed by 0 or more of any character). You can prefix the language code with a "-" to exclude it from the requested languages, e.g. --sub-langs all,-live_chat. Use --list-subs for a list of available language tags
   * @param langs Languages or regex patterns separated by commas.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  subLangs(langs: string) {
    if (!langs || !langs.trim()) {
      throw new Error('Subtitle languages must be provided');
    }
    this.once('subLangs', '--sub-langs');
    this.add(langs);
    return this;
  }

  /**
   * Login with this account ID
   * @param username The account ID to login with.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  username(username: string) {
    if (!username || !username.trim()) {
      throw new Error('Username must be provided');
    }
    this.once('username', '--username');
    this.add(username);
    return this;
  }

  /**
   * Account password. If this option is left out, yt-dlp will ask interactively
   * @param password The account password.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  password(password: string) {
    if (!password || !password.trim()) {
      throw new Error('Password must be provided');
    }
    this.once('password', '--password');
    this.add(password);
    return this;
  }

  /**
   * Two-factor authentication code
   * @param twofactor The 2FA code.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  twofactor(twofactor: string | number) {
    if (twofactor === undefined || twofactor === null) {
      throw new Error('Two-factor code must be provided');
    }
    this.once('twofactor', '--twofactor');
    this.add(String(twofactor));
    return this;
  }

  /**
   * Use .netrc authentication data
   * @returns The current instance of YtdlpCommandBuilder.
   */
  netrc() {
    this.once('netrc', '--netrc');
    return this;
  }

  /**
   * Location of .netrc authentication data; either the path or its containing directory. Defaults to ~/.netrc
   * @param path Path to the .netrc file or its directory.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  netrcLocation(path: string) {
    if (!path || !path.trim()) {
      throw new Error('Netrc location path must be provided');
    }
    this.once('netrcLocation', '--netrc-location');
    this.add(path);
    return this;
  }

  /**
   * Command to execute to get the credentials for an extractor.
   * @param cmd The command to execute.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  netrcCmd(cmd: string) {
    if (!cmd || !cmd.trim()) {
      throw new Error('Netrc command must be provided');
    }
    this.once('netrcCmd', '--netrc-cmd');
    this.add(cmd);
    return this;
  }

  /**
   * Video-specific password
   * @param password The video-specific password.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  videoPassword(password: string) {
    if (!password || !password.trim()) {
      throw new Error('Video password must be provided');
    }
    this.once('videoPassword', '--video-password');
    this.add(password);
    return this;
  }

  /**
   * Adobe Pass multiple-system operator (TV provider) identifier, use --ap-list-mso for a list of available MSOs
   * @param mso The MSO identifier.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  apMso(mso: string) {
    if (!mso || !mso.trim()) {
      throw new Error('MSO identifier must be provided');
    }
    this.once('apMso', '--ap-mso');
    this.add(mso);
    return this;
  }

  /**
   * Multiple-system operator account login
   * @param username The MSO account login.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  apUsername(username: string) {
    if (!username || !username.trim()) {
      throw new Error('AP username must be provided');
    }
    this.once('apUsername', '--ap-username');
    this.add(username);
    return this;
  }

  /**
   * Multiple-system operator account password. If this option is left out, yt-dlp will ask interactively
   * @param password The MSO account password.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  apPassword(password: string) {
    if (!password || !password.trim()) {
      throw new Error('AP password must be provided');
    }
    this.once('apPassword', '--ap-password');
    this.add(password);
    return this;
  }

  /**
   * List all supported multiple-system operators
   * @returns The current instance of YtdlpCommandBuilder.
   */
  apListMso() {
    this.once('apListMso', '--ap-list-mso');
    return this;
  }

  /**
   * Path to client certificate file in PEM format. May include the private key
   * @param certfile Path to the PEM certificate file.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  clientCertificate(certfile: string) {
    if (!certfile || !certfile.trim()) {
      throw new Error('Certificate file path must be provided');
    }
    this.once('clientCertificate', '--client-certificate');
    this.add(certfile);
    return this;
  }

  /**
   * Path to private key file for client certificate
   * @param keyfile Path to the private key file.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  clientCertificateKey(keyfile: string) {
    if (!keyfile || !keyfile.trim()) {
      throw new Error('Key file path must be provided');
    }
    this.once('clientCertificateKey', '--client-certificate-key');
    this.add(keyfile);
    return this;
  }

  /**
   * Password for client certificate private key, if encrypted. If not provided, and the key is encrypted, yt-dlp will ask interactively
   * @param password The certificate key password.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  clientCertificatePassword(password: string) {
    if (!password || !password.trim()) {
      throw new Error('Certificate password must be provided');
    }
    this.once('clientCertificatePassword', '--client-certificate-password');
    this.add(password);
    return this;
  }

  /**
   * Convert video files to audio-only files (requires ffmpeg and ffprobe)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  extractAudio() {
    this.once('extractAudio', '--extract-audio');
    return this;
  }

  /**
   * Format to convert the audio to when -x is used. (currently supported: best (default), aac, alac, flac, m4a, mp3, opus, vorbis, wav). You can specify multiple rules using similar syntax as --remux-video
   * @param format The audio format.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  audioFormat(format: AudioFormat | string = 'best') {
    if (!format || !format.trim()) {
      throw new Error('Audio format must be provided');
    }
    this.once('audioFormat', '--audio-format');
    this.add(format);
    return this;
  }

  /**
   * Specify ffmpeg audio quality to use when converting the audio with -x. Insert a value between 0 (best) and 10 (worst) for VBR or a specific bitrate like 128K (default 5)
   * @param quality Audio quality value or bitrate.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  audioQuality(quality: number | string = 5) {
    if (quality === undefined || quality === null) {
      throw new Error('Audio quality must be provided');
    }
    this.once('audioQuality', '--audio-quality');
    this.add(String(quality));
    return this;
  }

  /**
   * Remux the video into another container if necessary (currently supported: avi, flv, gif, mkv, mov, mp4, webm, aac, aiff, alac, flac, m4a, mka, mp3, ogg, opus, vorbis, wav). If the target container does not support the video/audio codec, remuxing will fail. You can specify multiple rules; e.g. "aac>m4a/mov>mp4/mkv" will remux aac to m4a, mov to mp4 and anything else to mkv
   * @param format The target container format or rules.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  remuxVideo(format: string) {
    if (!format || !format.trim()) {
      throw new Error('Remux format must be provided');
    }
    this.once('remuxVideo', '--remux-video');
    this.add(format);
    return this;
  }

  /**
   * Re-encode the video into another format if necessary. The syntax and supported formats are the same as --remux-video
   * @param format The target format or rules.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  recodeVideo(format: string) {
    if (!format || !format.trim()) {
      throw new Error('Recode format must be provided');
    }
    this.once('recodeVideo', '--recode-video');
    this.add(format);
    return this;
  }

  /**
   * Give these arguments to the postprocessors. Specify the postprocessor/executable name and the arguments separated by a colon ":" to give the argument to the specified postprocessor/executable. Supported PP are: Merger, ModifyChapters, SplitChapters, ExtractAudio, VideoRemuxer, VideoConvertor, Metadata, EmbedSubtitle, EmbedThumbnail, SubtitlesConvertor, ThumbnailsConvertor, FixupStretched, FixupM4a, FixupM3u8, FixupTimestamp and FixupDuration. The supported executables are: AtomicParsley, FFmpeg and FFprobe. You can also specify "PP+EXE:ARGS" to give the arguments to the specified executable only when being used by the specified postprocessor. Additionally, for ffmpeg/ffprobe, "_i"/"_o" can be appended to the prefix optionally followed by a number to pass the argument before the specified input/output file, e.g. --ppa "Merger+ffmpeg_i1:-v quiet". You can use this option multiple times to give different arguments to different postprocessors. (Alias: --ppa)
   * @param name Postprocessor or executable name (optionally with EXE and IO prefix).
   * @param args The arguments to pass.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  postprocessorArgs(name: PostProcessorName | PostProcessorExecutable | string, args: string) {
    if (!name || !name.trim()) {
      throw new Error('Postprocessor name must be provided');
    }
    if (!args || !args.trim()) {
      throw new Error('Postprocessor arguments must be provided');
    }
    this.add('--postprocessor-args');
    this.add(`${name}:${args}`);
    return this;
  }

  /**
   * Keep the intermediate video file on disk after post-processing
   * @returns The current instance of YtdlpCommandBuilder.
   */
  keepVideo() {
    this.once('keepVideo', '--keep-video');
    return this;
  }

  /**
   * Delete the intermediate video file after post-processing (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noKeepVideo() {
    this.once('noKeepVideo', '--no-keep-video');
    return this;
  }

  /**
   * Overwrite post-processed files (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  postOverwrites() {
    this.once('postOverwrites', '--post-overwrites');
    return this;
  }

  /**
   * Do not overwrite post-processed files
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noPostOverwrites() {
    this.once('noPostOverwrites', '--no-post-overwrites');
    return this;
  }

  /**
   * Embed subtitles in the video (only for mp4, webm and mkv videos)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  embedSubs() {
    this.once('embedSubs', '--embed-subs');
    return this;
  }

  /**
   * Do not embed subtitles (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noEmbedSubs() {
    this.once('noEmbedSubs', '--no-embed-subs');
    return this;
  }

  /**
   * Embed thumbnail in the video as cover art
   * @returns The current instance of YtdlpCommandBuilder.
   */
  embedThumbnail() {
    this.once('embedThumbnail', '--embed-thumbnail');
    return this;
  }

  /**
   * Do not embed thumbnail (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noEmbedThumbnail() {
    this.once('noEmbedThumbnail', '--no-embed-thumbnail');
    return this;
  }

  /**
   * Embed metadata to the video file. Also embeds chapters/infojson if present unless --no-embed-chapters/--no-embed-info-json are used (Alias: --add-metadata)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  embedMetadata() {
    this.once('embedMetadata', '--embed-metadata');
    return this;
  }

  /**
   * Do not add metadata to file (default) (Alias: --no-add-metadata)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noEmbedMetadata() {
    this.once('noEmbedMetadata', '--no-embed-metadata');
    return this;
  }

  /**
   * Add chapter markers to the video file (Alias: --add-chapters)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  embedChapters() {
    this.once('embedChapters', '--embed-chapters');
    return this;
  }

  /**
   * Do not add chapter markers (default) (Alias: --no-add-chapters)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noEmbedChapters() {
    this.once('noEmbedChapters', '--no-embed-chapters');
    return this;
  }

  /**
   * Embed the infojson as an attachment to mkv/mka video files
   * @returns The current instance of YtdlpCommandBuilder.
   */
  embedInfoJson() {
    this.once('embedInfoJson', '--embed-info-json');
    return this;
  }

  /**
   * Do not embed the infojson as an attachment to the video file
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noEmbedInfoJson() {
    this.once('noEmbedInfoJson', '--no-embed-info-json');
    return this;
  }

  /**
   * Parse additional metadata like title/artist from other fields; see "MODIFYING METADATA" for details in the yt-dlp README. Supported values of "WHEN" are the same as that of --use-postprocessor (default: pre_process)
   * @param fromTo The FROM:TO mapping string.
   * @param when Optional timing of when to parse.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  parseMetadata(fromTo: string, when: PostProcessorWhen = 'pre_process') {
    if (!fromTo || !fromTo.trim()) {
      throw new Error('Metadata mapping must be provided');
    }
    this.add('--parse-metadata');
    this.add(`${when}:${fromTo}`);
    return this;
  }

  /**
   * Replace text in a metadata field using the given regex. This option can be used multiple times. Supported values of "WHEN" are the same as that of --use-postprocessor (default: pre_process)
   * @param fields The metadata fields to target.
   * @param regex The regex pattern.
   * @param replace The replacement string.
   * @param when Optional timing of when to replace.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  replaceInMetadata(
    fields: string,
    regex: string,
    replace: string,
    when: PostProcessorWhen = 'pre_process'
  ) {
    if (!fields || !regex || replace === undefined) {
      throw new Error('Fields, regex, and replace values must be provided');
    }
    this.add('--replace-in-metadata');
    this.add(`${when}:${fields}`);
    this.add(regex);
    this.add(replace);
    return this;
  }

  /**
   * Write metadata to the video file's xattrs (using Dublin Core and XDG standards)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  xattrs() {
    this.once('xattrs', '--xattrs');
    return this;
  }

  /**
   * Concatenate videos in a playlist. One of "never", "always", or "multi_video" (default; only when the videos form a single show). All the video files must have the same codecs and number of streams to be concatenable. The "pl_video:" prefix can be used with "--paths" and "--output" to set the output filename for the concatenated files. See "OUTPUT TEMPLATE" for details in the yt-dlp README.
   * @param policy Concatenation policy.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  concatPlaylist(policy: 'never' | 'always' | 'multi_video' = 'multi_video') {
    if (!policy) {
      throw new Error('Concat policy must be provided');
    }
    this.once('concatPlaylist', '--concat-playlist');
    this.add(policy);
    return this;
  }

  /**
   * Automatically correct known faults of the file. One of never (do nothing), warn (only emit a warning), detect_or_warn (the default; fix the file if we can, warn otherwise), force (try fixing even if the file already exists)
   * @param policy Fixup policy.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  fixup(policy: 'never' | 'warn' | 'detect_or_warn' | 'force' = 'detect_or_warn') {
    if (!policy) {
      throw new Error('Fixup policy must be provided');
    }
    this.once('fixup', '--fixup');
    this.add(policy);
    return this;
  }

  /**
   * Location of the ffmpeg binary; either the path to the binary or its containing directory
   * @param path Path to ffmpeg.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  ffmpegLocation(path: string) {
    if (!path || !path.trim()) {
      throw new Error('FFmpeg path must be provided');
    }
    this.once('ffmpegLocation', '--ffmpeg-location');
    this.add(path);
    return this;
  }

  /**
   * Execute a command, optionally prefixed with when to execute it, separated by a ":". Supported values of "WHEN" are the same as that of --use-postprocessor (default: after_move). The same syntax as the output template can be used to pass any field as arguments to the command. If no fields are passed, %(filepath,_filename|)q is appended to the end of the command. This option can be used multiple times
   * @param cmd The command to execute.
   * @param when Optional timing of when to execute.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  exec(cmd: string, when: PostProcessorWhen = 'after_move') {
    if (!cmd || !cmd.trim()) {
      throw new Error('Command must be provided');
    }
    this.add('--exec');
    this.add(`${when}:${cmd}`);
    return this;
  }

  /**
   * Remove any previously defined --exec
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noExec() {
    this.once('noExec', '--no-exec');
    return this;
  }

  /**
   * Convert the subtitles to another format (currently supported: ass, lrc, srt, vtt). Use "--convert-subs none" to disable conversion (default) (Alias: --convert-subtitles)
   * @param format Subtitle format or "none".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  convertSubs(format: 'ass' | 'lrc' | 'srt' | 'vtt' | 'none' = 'none') {
    if (!format) {
      throw new Error('Subtitle format must be provided');
    }
    this.once('convertSubs', '--convert-subs');
    this.add(format);
    return this;
  }

  /**
   * Convert the thumbnails to another format (currently supported: jpg, png, webp). You can specify multiple rules using similar syntax as "--remux-video". Use "--convert-thumbnails none" to disable conversion (default)
   * @param format Thumbnail format or "none".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  convertThumbnails(format: 'jpg' | 'png' | 'webp' | 'none' | string = 'none') {
    if (!format) {
      throw new Error('Thumbnail format must be provided');
    }
    this.once('convertThumbnails', '--convert-thumbnails');
    this.add(format);
    return this;
  }

  /**
   * Split video into multiple files based on internal chapters. The "chapter:" prefix can be used with "--paths" and "--output" to set the output filename for the split files. See "OUTPUT TEMPLATE" for details in the yt-dlp README.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  splitChapters() {
    this.once('splitChapters', '--split-chapters');
    return this;
  }

  /**
   * Do not split video based on chapters (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noSplitChapters() {
    this.once('noSplitChapters', '--no-split-chapters');
    return this;
  }

  /**
   * Remove chapters whose title matches the given regular expression. The syntax is the same as --download-sections. This option can be used multiple times
   * @param regex The regex pattern for chapter titles.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  removeChapters(regex: string) {
    if (!regex || !regex.trim()) {
      throw new Error('Chapter removal regex must be provided');
    }
    this.add('--remove-chapters');
    this.add(regex);
    return this;
  }

  /**
   * Do not remove any chapters from the file (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noRemoveChapters() {
    this.once('noRemoveChapters', '--no-remove-chapters');
    return this;
  }

  /**
   * Force keyframes at cuts when downloading/splitting/removing sections. This is slow due to needing a re-encode, but the resulting video may have fewer artifacts around the cuts
   * @returns The current instance of YtdlpCommandBuilder.
   */
  forceKeyframesAtCuts() {
    this.once('forceKeyframesAtCuts', '--force-keyframes-at-cuts');
    return this;
  }

  /**
   * Do not force keyframes around the chapters when cutting/splitting (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noForceKeyframesAtCuts() {
    this.once('noForceKeyframesAtCuts', '--no-force-keyframes-at-cuts');
    return this;
  }

  /**
   * The (case-sensitive) name of plugin postprocessors to be enabled, and (optionally) arguments to be passed to it, separated by a colon ":". ARGS are a semicolon ";" delimited list of NAME=VALUE. The "when" argument determines when the postprocessor is invoked. It can be one of "pre_process" (after video extraction), "after_filter" (after video passes filter), "video" (after --format; before --print/--output), "before_dl" (before each video download), "post_process" (after each video download; default), "after_move" (after moving the video file to its final location), "after_video" (after downloading and processing all formats of a video), or "playlist" (at end of playlist). This option can be used multiple times to add different postprocessors
   * @param name Postprocessor name with optional arguments.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  usePostprocessor(name: string) {
    if (!name || !name.trim()) {
      throw new Error('Postprocessor name must be provided');
    }
    this.add('--use-postprocessor');
    this.add(name);
    return this;
  }

  /**
   * SponsorBlock categories to create chapters for, separated by commas. Available categories are sponsor, intro, outro, selfpromo, preview, filler, interaction, music_offtopic, hook, poi_highlight, chapter, all and default (=all). You can prefix the category with a "-" to exclude it.
   * @param categories Categories to mark, e.g., "all,-preview" or ["sponsor", "intro"].
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sponsorblockMark(categories: SponsorBlockCategory | string | (SponsorBlockCategory | string)[]) {
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      throw new Error('SponsorBlock categories must be provided');
    }
    const value = Array.isArray(categories) ? categories.join(',') : categories;
    this.once('sponsorblockMark', '--sponsorblock-mark');
    this.add(value);
    return this;
  }

  /**
   * SponsorBlock categories to be removed from the video file, separated by commas. If a category is present in both mark and remove, remove takes precedence. The syntax and available categories are the same as for --sponsorblock-mark except that "default" refers to "all,-filler" and poi_highlight, chapter are not available
   * @param categories Categories to remove, e.g., "all,-filler".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sponsorblockRemove(
    categories: SponsorBlockCategory | string | (SponsorBlockCategory | string)[]
  ) {
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      throw new Error('SponsorBlock categories must be provided');
    }
    const value = Array.isArray(categories) ? categories.join(',') : categories;
    this.once('sponsorblockRemove', '--sponsorblock-remove');
    this.add(value);
    return this;
  }

  /**
   * An output template for the title of the SponsorBlock chapters created by --sponsorblock-mark. The only available fields are start_time, end_time, category, categories, name, category_names. Defaults to "[SponsorBlock]: %(category_names)l"
   * @param template Output template for chapter titles.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sponsorblockChapterTitle(template: string = '[SponsorBlock]: %(category_names)l') {
    if (!template || !template.trim()) {
      throw new Error('SponsorBlock chapter title template must be provided');
    }
    this.once('sponsorblockChapterTitle', '--sponsorblock-chapter-title');
    this.add(template);
    return this;
  }

  /**
   * Disable both --sponsorblock-mark and --sponsorblock-remove
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noSponsorblock() {
    this.once('noSponsorblock', '--no-sponsorblock');
    return this;
  }

  /**
   * SponsorBlock API location, defaults to https://sponsor.ajay.app
   * @param url API URL.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  sponsorblockApi(url: string = 'https://sponsor.ajay.app') {
    if (!url || !url.trim()) {
      throw new Error('SponsorBlock API URL must be provided');
    }
    this.once('sponsorblockApi', '--sponsorblock-api');
    this.add(url);
    return this;
  }

  /**
   * Number of retries for known extractor errors (default is 3), or "infinite"
   * @param retries Number of retries or "infinite".
   * @returns The current instance of YtdlpCommandBuilder.
   */
  extractorRetries(retries: number | 'infinite' = 3) {
    if (typeof retries === 'number') {
      if (!Number.isInteger(retries) || retries < 0) {
        throw new Error('Extractor retries must be a non-negative integer');
      }
    } else if (retries !== 'infinite') {
      throw new Error('Extractor retries must be a number or "infinite"');
    }

    this.once('extractorRetries', '--extractor-retries');
    this.add(String(retries));
    return this;
  }

  /**
   * Process dynamic DASH manifests (default) (Alias: --no-ignore-dynamic-mpd)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  allowDynamicMpd() {
    this.once('allowDynamicMpd', '--allow-dynamic-mpd');
    return this;
  }

  /**
   * Do not process dynamic DASH manifests (Alias: --no-allow-dynamic-mpd)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  ignoreDynamicMpd() {
    this.once('ignoreDynamicMpd', '--ignore-dynamic-mpd');
    return this;
  }

  /**
   * Split HLS playlists to different formats at discontinuities such as ad breaks
   * @returns The current instance of YtdlpCommandBuilder.
   */
  hlsSplitDiscontinuity() {
    this.once('hlsSplitDiscontinuity', '--hls-split-discontinuity');
    return this;
  }

  /**
   * Do not split HLS playlists into different formats at discontinuities such as ad breaks (default)
   * @returns The current instance of YtdlpCommandBuilder.
   */
  noHlsSplitDiscontinuity() {
    this.once('noHlsSplitDiscontinuity', '--no-hls-split-discontinuity');
    return this;
  }

  /**
   * Pass ARGS arguments to the IE_KEY extractor. See "EXTRACTOR ARGUMENTS" for details in the yt-dlp README. You can use this option multiple times to give arguments for different extractors
   * @param ieKey The extractor key (e.g., "youtube", "twitch").
   * @param args The arguments string for the extractor.
   * @returns The current instance of YtdlpCommandBuilder.
   */
  extractorArgs(ieKey: string, args: string) {
    if (!ieKey || !ieKey.trim()) {
      throw new Error('Extractor key must be provided');
    }
    if (!args || !args.trim()) {
      throw new Error('Extractor arguments must be provided');
    }

    this.add('--extractor-args');
    this.add(`${ieKey}:${args}`);
    return this;
  }
}
