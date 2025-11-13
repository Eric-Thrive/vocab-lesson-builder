# Vocabulary Lesson Builder

An interactive vocabulary lesson builder for 6th grade students, featuring AI-generated content, graphic novel style images, stories, and practice activities.

## Features

- **AI-Generated Lessons** using Google Gemini 2.5 Flash
- **Graphic Novel Style Images** using Google Nano Banana (gemini-2.5-flash-image)
- **Age-Appropriate Content** for 6th grade students (11-12 years old)
- **Short, Simple Examples** (5-8 words) suitable for 2nd-3rd grade reading level
- Pre-teaching section with definitions, contextual images, and examples
- Interactive story section with varied themes (adventure, mystery, sports, science, friendship)
- Practice activities (fill-in-the-blank, matching, comprehension)
- Save and load lessons locally
- Edit definitions and images on the fly
- Progress tracking during image generation
- **Share lessons with short URLs** - Deploy to GitHub and share `yoursite.com?lesson=animals` instead of long base64 URLs!

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Sharing Lessons with Students

### Automatic (Recommended)

Set up **GitHub Auto-Save** for instant sharing:
1. Follow [GITHUB_SETUP.md](GITHUB_SETUP.md) to configure
2. Enable the toggle in the app
3. Create a lesson - it automatically saves to GitHub!
4. Share the short URL: `yoursite.com?lesson=animals-lesson`

### Manual (Alternative)

1. Create a lesson in the app
2. Click "Share Link for Students"
3. Download the lesson JSON file
4. Add it to `public/lessons/` folder
5. Deploy to GitHub Pages, Netlify, or Vercel
6. Share the short URL: `yoursite.com?lesson=animals-lesson`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Legacy Share (Long URLs)

The app still supports the old base64 URL format for quick sharing without deployment, but these URLs can be very long.

## Deployment

This app can be deployed to:
- **GitHub Pages** (free, easy) - Recommended
- **Netlify** (free, automatic deployments)
- **Vercel** (free, fast)
- Any static hosting service

Simply run `npm run build` and deploy the `dist` folder.

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Environment Variables

You'll need a free Google API key from https://aistudio.google.com/app/apikey

Add it to your `.env` file:
```
VITE_GOOGLE_API_KEY=your-key-here
```

The same key works for both Gemini (text generation) and Imagen 3 (image generation)!
