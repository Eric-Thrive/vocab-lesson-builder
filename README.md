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

## Deployment

This app can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Simply run `npm run build` and deploy the `dist` folder.

## Environment Variables

You'll need a free Google API key from https://aistudio.google.com/app/apikey

Add it to your `.env` file:
```
VITE_GOOGLE_API_KEY=your-key-here
```

The same key works for both Gemini (text generation) and Imagen 3 (image generation)!
