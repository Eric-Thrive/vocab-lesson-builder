# Google Imagen 3 Setup Guide

Google's Imagen 3 is available through **Vertex AI**, which requires a Google Cloud project setup. Here's how to access it:

## Option 1: Vertex AI (Official, Requires Google Cloud)

### Steps:

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one
   - Enable billing (Google Cloud has a free tier with $300 credit for new users)

2. **Enable Vertex AI API**
   - In your Google Cloud Console, go to "APIs & Services"
   - Search for "Vertex AI API"
   - Click "Enable"

3. **Enable Imagen API**
   - Search for "Vertex AI Imagen API"
   - Click "Enable"

4. **Create Service Account & Key**
   - Go to "IAM & Admin" > "Service Accounts"
   - Create a new service account
   - Grant it "Vertex AI User" role
   - Create a JSON key and download it

5. **Use the API**
   - The Imagen 3 endpoint is:
     ```
     https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict
     ```
   - You'll need to authenticate with OAuth2 or service account credentials

### Pricing:
- **Free tier**: $300 credit for new Google Cloud users
- **Imagen 3**: ~$0.02-0.04 per image (varies by resolution)
- For 10 words per lesson: ~$0.20-0.40 per lesson

## Option 2: AI Studio (Simpler, but Limited)

Google AI Studio (https://aistudio.google.com/) currently only supports text models like Gemini, not Imagen yet. They may add it in the future.

## Option 3: Alternative Image Generation APIs

If Vertex AI setup is too complex, here are simpler alternatives:

### A. Pollinations.ai (Free, No API Key)
```javascript
const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true`;
```
- Completely free
- No API key needed
- Good quality
- Works directly from browser

### B. Stability AI (SDXL)
- Sign up at https://platform.stability.ai/
- Get API key
- $10 credit for new users
- ~$0.004 per image

### C. Replicate (Multiple Models)
- Sign up at https://replicate.com/
- Get API key
- Pay-as-you-go pricing
- Access to SDXL, DALL-E alternatives

## Recommendation for This Project

For a simple educational app, I recommend:

1. **Start with Pollinations.ai** - Free, no setup, works immediately
2. **Upgrade to Vertex AI Imagen** - When you need higher quality and have budget
3. **Use Unsplash** - Current fallback, good quality stock photos

Would you like me to implement Pollinations.ai? It's free and will generate custom images based on your word examples without any complex setup!
