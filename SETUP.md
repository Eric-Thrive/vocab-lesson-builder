# Setup Instructions

## Step 1: Get a Free Google API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

## Step 2: Add Your API Key

1. Open the `.env` file in the `vocab-lesson-app` folder
2. Add your Google API key:
   ```
   VITE_GOOGLE_API_KEY=your-actual-key-here
   ```
3. Save the file

## Step 3: Start/Restart the Dev Server

The server should automatically pick up the changes. If not:
- The dev server is running at http://localhost:5173/
- Refresh your browser

## Step 4: Test the App

1. Go to http://localhost:5173/
2. Enter some vocabulary words (one per line), for example:
   ```
   brave
   rescue
   danger
   hero
   adventure
   ```
3. Click "Create Lesson"
4. Wait 5-10 seconds for the AI to generate your lesson!

## Why Google Gemini + Imagen 3?

- **Free**: Generous free tier with 15 requests per minute
- **No CORS issues**: Works directly from the browser
- **Fast**: Quick response times
- **Good quality**: Gemini 1.5 Flash is great for educational content
- **Custom AI Images**: Uses Google's Imagen 3 to generate unique, contextual images based on the example sentences for each word
- **Educational**: Images show the word in context, making learning more effective

## Important Notes

- The `.env` file is in `.gitignore` so your API key won't be committed to git
- Google's API works directly from the browser (no proxy needed!)
- For production, consider rate limiting and API key protection
- **Now using Google Imagen 3** to generate custom AI images for each vocabulary word based on the example sentences!
- Image generation takes about 2-3 seconds per word, so expect 20-30 seconds total for a full lesson
