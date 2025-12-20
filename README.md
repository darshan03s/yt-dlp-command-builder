# yt-dlp-command-builder

A fluent, type-safe, and zero-dependency TypeScript command builder for [yt-dlp](https://github.com/yt-dlp/yt-dlp).

This library provides a structured way to build commands with full IDE IntelliSense support, internal validation.

## Features

- **🚀 Fluent API:** Chainable methods for a readable, declarative syntax.
- **🛡️ Type Safe:** Enums and types for formats, protocols, and browsers (no more guessing flag names).
- **✅ Built-in Validation:** Prevents calling unique flags multiple times and validates numeric ranges/formats.
- **📦 Zero Dependencies:** Lightweight and focused.
- **📖 Comprehensive:** Covers almost every `yt-dlp` category: Networking, Post-processing, SponsorBlock, Subtitles, and more.

## Installation

```bash
npm install yt-dlp-command-builder
# or
yarn add yt-dlp-command-builder
# or
pnpm add yt-dlp-command-builder
```

## Basic Usage

```typescript
import { YtdlpCommandBuilder } from 'yt-dlp-command-builder';

const builder = new YtdlpCommandBuilder()
  .url('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .format('bestvideo+bestaudio/best')
  .output('%(title)s.%(ext)s')
  .noOverwrites();

const build = builder.build();
// Output: yt-dlp https://www.youtube.com/watch?v=dQw4w9WgXcQ --format bestvideo+bestaudio/best --output %(title)s.%(ext)s --no-overwrites

const { baseCommand, args, completeCommand } = builder.get();
// Output:
// {
//   baseCommand: 'yt-dlp',
//   args: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ' ,'--format' ,'bestvideo+bestaudio/best', '--output' ,'%(title)s.%(ext)s' ,'--no-overwrites'],
//   completeCommand: yt-dlp https://www.youtube.com/watch?v=dQw4w9WgXcQ --format bestvideo+bestaudio/best --output %(title)s.%(ext)s --no-overwrites
// }
```

## Advanced Examples

### Audio Extraction & Post-Processing

```typescript
const command = new YtdlpCommandBuilder('/usr/local/bin/yt-dlp')
  .url('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .extractAudio()
  .audioFormat('mp3')
  .audioQuality(0) // Best quality
  .embedThumbnail()
  .embedMetadata()
  .sponsorblockRemove('all')
  .build();
```

### Complex Filtering & Sections

```typescript
const command = new YtdlpCommandBuilder()
  .url('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .downloadSections({ start: '00:01:00', end: '00:02:00' })
  .matchFilters('duration > 60 & like_count > 100')
  .concurrentFragments(5)
  .build();
```

## Integration with Node.js

You can easily use the output of the builder with `child_process`:

```typescript
// Using exec
import { exec } from 'child_process';
import { YtdlpCommandBuilder } from 'yt-dlp-command-builder';

const { baseCommand, args, completeCommand } = new YtdlpCommandBuilder()
  .url('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .dumpJson()
  .get();

exec(completeCommand, (error, stdout, stderr) => {
  const info = JSON.parse(stdout);
  console.log(info.title);

  // Output: Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)
});
```

```typescript
// Using spawn
import { spawn } from 'child_process';
import { YtdlpCommandBuilder } from 'yt-dlp-command-builder';

const { baseCommand, args } = new YtdlpCommandBuilder()
  .url('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .cookiesFromBrowser('firefox')
  .jsRuntime('node')
  .newline()
  .output('%(title)s.%(ext)s')
  .format('136+ba/bv+ba')
  .mergeOutputFormat('mp4')
  .get();

const child = spawn(baseCommand, args);

child.stdout.setEncoding('utf-8');
child.stderr.setEncoding('utf-8');

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`Process exited with code: ${code}`);
});
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
