# Icon Paint Bucket

A modern, production-ready SVG icon recoloring tool built with React, Vite, and Tailwind CSS.

![Icon Paint Bucket](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## Features

- **Drag & Drop Upload**: Drop SVG files or click to browse
- **Brand Color Presets**: 4 pre-configured brand color palettes
  - RINVOQ Yellow
  - Novartis Orange
  - GSK Orange
  - Custom Brand (Blue)
- **One-Click Recoloring**: Click any icon to apply selected brand colors
- **Smart Color Mapping**: Automatically maps black → primary, gray → secondary, light gray → accent
- **Batch Operations**: Paint all icons at once, download as ZIP
- **Persistent Selection**: Remembers your last selected brand
- **Beautiful UI**: Modern glass-morphism design with smooth animations
- **Mobile Responsive**: Works great on all screen sizes

## Tech Stack

- **React 18** - Modern functional components with hooks
- **Vite 5** - Lightning-fast development and optimized builds
- **Tailwind CSS 3.4** - Utility-first styling
- **JSZip** - Client-side ZIP file generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/icon-paint-bucket.git
cd icon-paint-bucket

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Deploy to Netlify

#### Option 1: One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/icon-paint-bucket)

#### Option 2: Manual Deploy

1. Push your code to GitHub
2. Log in to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

#### Option 3: CLI Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (creates new site)
netlify deploy --prod
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to GitHub Pages

1. Add to `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/icon-paint-bucket/',
     // ...
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

## Color Mapping

The tool uses intelligent color mapping:

| Original Color | Maps To |
|---------------|---------|
| Black (#000, #333, etc.) | Primary brand color |
| Gray (#666, #808080, etc.) | Secondary brand color |
| Light Gray (#CCC, #DDD, etc.) | Accent brand color |
| White, Transparent | Preserved (no change) |

Supported formats:
- Hex: `#000`, `#000000`
- Named: `black`, `gray`, `white`
- RGB: `rgb(0, 0, 0)`
- Attributes: `fill`, `stroke`, `stop-color`
- Inline styles: `style="fill: #000"`

## Project Structure

```
icon-paint-bucket/
├── public/
│   └── paint-bucket.svg      # Favicon
├── src/
│   ├── components/
│   │   ├── DropZone.jsx      # File upload component
│   │   ├── IconGrid.jsx      # Grid of uploaded icons
│   │   ├── IconItem.jsx      # Individual icon card
│   │   └── PaintBucket.jsx   # Brand color selector
│   ├── constants/
│   │   └── brands.js         # Brand color definitions
│   ├── utils/
│   │   ├── colorMapper.js    # SVG color manipulation
│   │   └── fileHandler.js    # File upload/download
│   ├── App.jsx               # Main application
│   ├── index.css             # Tailwind + custom styles
│   └── main.jsx              # Entry point
├── index.html
├── netlify.toml              # Netlify configuration
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Customization

### Adding New Brand Colors

Edit `src/constants/brands.js`:

```js
{
  id: 'my-brand',
  name: 'My Brand',
  primary: '#FF0000',
  secondary: '#00FF00',
  accent: '#0000FF',
  gradient: 'from-red-500 to-green-500',
  bgLight: 'bg-red-50',
}
```

### Modifying Color Mappings

Edit `src/utils/colorMapper.js` to add or modify which colors get mapped:

```js
const COLOR_MAPPINGS = {
  primary: ['#000', '#000000', /* add more */],
  secondary: ['#666', '#808080', /* add more */],
  accent: ['#ccc', '#cccccc', /* add more */],
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this in your own projects!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
