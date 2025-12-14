# raskell.io

Personal tech blog powered by Zola and managed with mise.

## Prerequisites

- [mise](https://mise.jdx.dev/) - Development tool version manager and task runner

## Quick Start

1. Install mise if you haven't already:
   ```bash
   curl https://mise.run | sh
   ```

2. Setup the project (downloads fonts and converts images):
   ```bash
   mise run setup
   ```

3. Start the development server:
   ```bash
   mise run serve
   ```

4. Visit http://127.0.0.1:1025

## Available Tasks

Run `mise tasks` to see all available tasks:

- `mise run serve` - Start development server
- `mise run build` - Build for production
- `mise run setup` - Download fonts and convert images
- `mise run download-fonts` - Download Geist fonts
- `mise run convert-images` - Convert images to AVIF format
- `mise run new <slug>` - Create a new article
- `mise run clean` - Remove the public directory

## Image Conversion

The project automatically converts images to AVIF format for better performance. This requires ImageMagick or ffmpeg:

```bash
# macOS
brew install imagemagick

# Linux
apt-get install imagemagick
```

Images are served using the `<picture>` element with AVIF format and PNG/JPG fallbacks.

## Fonts

The project uses Geist fonts from Vercel, automatically downloaded via mise tasks. No npm dependencies required.

## Tech Stack

- **Static Site Generator**: [Zola](https://www.getzola.org/)
- **Typography**: Geist & Geist Mono (variable fonts)
- **Color Theme**: Catppuccin (Latte for light, Mocha for dark)
- **Task Runner**: [mise](https://mise.jdx.dev/)
- **Image Format**: AVIF with fallbacks
