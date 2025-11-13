# Setup Checklist

Quick checklist to get your Vocabulary Lesson Builder running.

## Basic Setup (10 minutes)

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Get Google API key from https://aistudio.google.com/app/apikey
- [ ] Add `VITE_GOOGLE_API_KEY` to `.env`
- [ ] Run `npm run dev`
- [ ] Create test lesson

## GitHub Auto-Save (5 minutes)

- [ ] Get token from https://github.com/settings/tokens
- [ ] Add to `.env`: VITE_GITHUB_TOKEN, VITE_GITHUB_OWNER, VITE_GITHUB_REPO
- [ ] Restart dev server
- [ ] Enable toggle in app
- [ ] Test with lesson

## Deploy (5 minutes)

Choose one:
- [ ] Netlify: Connect repo, auto-deploy
- [ ] Vercel: Connect repo, auto-deploy  
- [ ] GitHub Pages: Manual deployment

See DEPLOYMENT.md for details.

## Documentation

- README.md - Overview
- GITHUB_AUTO_SAVE_QUICKSTART.md - 5-min setup
- DEPLOYMENT.md - Deploy options
- FEATURES.md - Feature list
