# 🎯 GupAd Orchestration Platform

AI-Powered Audience Targeting Platform for digital advertising.

## Features

- **AI-Powered Search**: Intelligent signal discovery using advanced algorithms
- **Multi-Platform Support**: Facebook, Google, TikTok, and more
- **Custom Segments**: AI-generated audience proposals
- **Real-time Analytics**: Live coverage and CPM data
- **Mobile Responsive**: Optimized for all devices

## Deployment

This is a static website that can be deployed to Vercel, Netlify, or any static hosting service.

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the static site configuration
3. The `vercel.json` file ensures proper MIME type handling

### Local Development

```bash
# Install dependencies (optional)
npm install

# Start local server
npm start
```

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # Custom styles
├── app.js             # JavaScript functionality
├── vercel.json        # Vercel configuration
├── package.json       # Project metadata
└── README.md          # This file
```

## MIME Type Configuration

The `vercel.json` file includes proper MIME type headers to prevent file downloads:

- HTML files: `text/html; charset=utf-8`
- CSS files: `text/css; charset=utf-8`
- JS files: `application/javascript; charset=utf-8`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License
