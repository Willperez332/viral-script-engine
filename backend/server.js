const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.1' });
});

// Process videos with Gemini
app.post('/api/process-videos', upload.array('videos', 3), async (req, res) => {
  try {
    const { geminiApiKey } = req.body;
    
    if (!geminiApiKey) {
      return res.status(400).json({ error: 'Gemini API key required' });
    }

    console.log(`Processing ${req.files.length} videos...`);

    const transcripts = await Promise.all(
      req.files.map(async (file, index) => {
        console.log(`Uploading video ${index + 1}: ${file.originalname}`);
        
        // Upload to Gemini Files API
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });

        const uploadResponse = await axios.post(
          `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${geminiApiKey}`,
          formData,
          { 
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          }
        );

        const fileUri = uploadResponse.data.file.uri;
        const fileName = uploadResponse.data.file.name;
        console.log(`File uploaded: ${fileName}, URI: ${fileUri}`);

        // Wait for Gemini to process the video
        console.log('Waiting for video processing...');
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Generate transcript using Gemini 1.5 Flash
        console.log('Generating transcript...');
        const generateResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this video clip and provide:
1. A brief description of who/what is in the video (e.g., "TikTok video of woman showing McDonald's burger", "Kevin Gates on livestream", "Dr. Bobby Price podcast interview")
2. A complete transcript of what is said

Format your response EXACTLY as:
Description: [your description]
Transcript: [full transcript]`
                  },
                  {
                    fileData: {
                      mimeType: file.mimetype,
                      fileUri: fileUri
                    }
                  }
                ]
              }
            ]
          }
        );

        const result = generateResponse.data.candidates[0].content.parts[0].text;
        console.log(`Video ${index + 1} processed successfully`);
        return result;
      })
    );

    res.json({ transcripts });
  } catch (error) {
    console.error('Video processing error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to process videos',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Generate scripts with Claude
app.post('/api/generate-scripts', async (req, res) => {
  try {
    const { clips, productLink, mode } = req.body;

    const clipOrder = mode === 'STRICT' 
      ? 'Use clips in exact order provided (1→2→3). Use ALL clips.'
      : 'Analyze clips and reorder for maximum impact. May skip clips if needed.';

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4500,
        messages: [{
          role: 'user',
          content: `Generate a script matching these example patterns:

EXAMPLE HOOK STYLES:
"Why the fuck is nobody talking about what just happened on this episode of the Kardashians? I'm gonna play the clip for you right here."
"This fucker went after the most predatory industry in the world and got silenced for it. Watch this clip before they take it down."
"Why is nobody talking about how everyone is just aging in reverse? This mother and daughter are exposing the truth."
"This is the most fucked up Simpsons prediction ever, and America made this evil shit come true!?"

EXAMPLE SCRIPT SEGMENT:
**Backend 5 — POINTING UP**
NO CAPTIONS ON SCREEN. NO CAMERA MOVEMENTS. NO EDITS.
Handheld phone video style. Make the avatar say in a concerned tone:
"Now the crazy thing is our body's naturally produce NAD, but after we turn around 30 years old, that's when our NAD levels start to plummet and the aging process starts."

EXAMPLE PRODUCT REVEAL:
**Backend 10 — HOLDING PRODUCT**
NO CAPTIONS ON SCREEN. NO CAMERA MOVEMENTS. NO EDITS.
Handheld phone video style. Make the avatar say in a helpful tone:
"Now I spoke to my doctor and this is the one they recommended for me from Micro Ingredients."

EXAMPLE CTA:
**Backend 13 — HOLDING PRODUCT**
NO CAPTIONS ON SCREEN. NO CAMERA MOVEMENTS. NO EDITS.
Handheld phone video style. Make the avatar say in a closing CTA tone:
"So if you did wanna try this and you're still seeing the link in this video, I would run and grab a bottle before they are completely gone."

ALTERNATIVE CTA EXAMPLES:
"If you see that orange cart down below, that means you can still pick up one, but if that cart isn't there, they already sold out."
"Link's right here in the video. If you can still see it, grab some while you can."
"The button should be right there on this video. If it's still showing up, they haven't sold out yet."

---

YOUR TASK:
${clipOrder}

CLIPS PROVIDED:
${clips.map((clip, i) => `Clip ${i + 1}: ${clip}`).join('\n\n')}

PRODUCT: ${productLink}

Generate a complete script following this EXACT format and style with 12 backend segments, 2 hooks, and marked clip placements.

CRITICAL RULES:
- Keep EVERY dialogue segment under 20 words
- Use casual language (swearing is natural where appropriate)
- Reference SPECIFIC sources in hooks (names, shows, platforms)
- Match the energy/style of the example hooks
- Each segment = ~8 seconds of speaking
- Mark clip placements clearly`
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      }
    );

    res.json({ 
      script: response.data.content[0].text,
      mode 
    });
  } catch (error) {
    console.error('Script generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate script',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server v1.0.1 running on port ${PORT}`);
});
