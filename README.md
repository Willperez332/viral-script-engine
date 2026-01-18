# 🌙 Viral Script Engine - Operation Moonscale

AI-powered script generator that processes video clips and creates viral conspiracy-style scripts for social media.

## Features

- 🎥 **Video Upload & Auto-Transcription** - Upload videos, AI transcribes automatically
- 🤖 **Dual Script Generation** - Get 2 variations (Your Vision + AI Optimized)
- ⚡ **8-Second Veo Format** - Scripts formatted for video generation
- 🔥 **Viral Hook Patterns** - Based on 100+ winning scripts

## Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express
- **APIs:** Google Gemini (video processing) + Anthropic Claude (script generation)
- **Deploy:** Railway

## Quick Deploy to Railway

### Step 1: Push to GitHub

```bash
# Initialize git
cd viral-script-engine
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `viral-script-engine` repo
4. Railway will auto-detect and deploy!
5. Click "Generate Domain" to get your live URL

### Step 3: Set Environment Variables (Optional)

In Railway dashboard, add these if you want:
- `PORT` - Defaults to 3001 (Railway auto-assigns)
- `NODE_ENV` - Set to `production`

That's it! Your app is live 🚀

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm run install-all

# Run backend (Terminal 1)
npm run dev:backend

# Run frontend (Terminal 2 - in new terminal)
npm run dev:frontend
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## Usage

1. **Get API Keys:**
   - Gemini API: https://aistudio.google.com/app/apikey (free)

2. **Upload Videos:**
   - Drop 2-3 viral clip videos
   - Click "Process Videos"
   - AI auto-transcribes

3. **Generate Scripts:**
   - Review/edit transcripts
   - Add product link
   - Click "Generate Scripts"
   - Get 2 variations instantly

4. **Copy & Use:**
   - Copy script to Veo
   - Generate videos
   - Post to TikTok/Facebook

## File Structure

```
viral-script-engine/
├── backend/
│   ├── server.js          # Express API
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── index.jsx
│   │   └── index.css
│   ├── public/
│   └── package.json
├── railway.json           # Railway config
├── package.json
└── README.md
```

## API Endpoints

### `POST /api/process-videos`
Process videos with Gemini AI
- Body: FormData with video files + geminiApiKey
- Returns: Array of transcripts

### `POST /api/generate-scripts`
Generate scripts with Claude
- Body: { clips, productLink, mode }
- Returns: Generated script

## Environment Variables

Create `.env` in backend folder (optional):
```
PORT=3001
NODE_ENV=development
```

## Troubleshooting

**Videos not processing?**
- Check Gemini API key is valid
- Try smaller video files (< 50MB)
- Check console for error details

**Scripts not generating?**
- Ensure 2+ transcripts are provided
- Add product link
- Check browser console

**Railway deployment fails?**
- Ensure `railway.json` is in root
- Check build logs in Railway dashboard
- Verify Node version >= 18

## Cost

- **Railway:** Free tier (500 hours/month)
- **Gemini API:** Free tier (1,500 requests/day)
- **Claude API:** Integrated into claude.ai (no extra cost)

## Contributing

This is Operation Moonscale - a content production supercharger. Scale responsibly! 🌙

## License

MIT
