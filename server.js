require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API keys on startup
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY missing in .env file');
  console.log('Please add: GROQ_API_KEY=your_groq_api_key_here');
}

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY missing in .env file');
  console.log('Please add: GEMINI_API_KEY=your_gemini_api_key_here');
}

const SYSTEM_PROMPT = `You are a friendly Indian tutor who explains concepts in simple Hinglish (mix of Hindi and English).
The student may ask in Hindi, English, or mixed language. Always respond in simple Hinglish.
Give step-by-step explanations. Use examples from daily Indian life. Keep it friendly, like explaining to a younger sibling.
Never use complicated English words when a simple Hindi word works better.
Format your answer clearly with numbered steps when explaining a process.`;

async function callGroq(subject, question) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Subject: ${subject}. Question: ${question}` }
        ],
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Groq API quota exceed ho gaya hai. Thodi der baad try karo ya naya API key use karo.');
    } else if (error.response?.status === 401) {
      throw new Error('Groq API key sahi nahi hai. API key check karo.');
    } else if (error.response?.status === 400) {
      throw new Error('Request format sahi nahi hai. Dobara try karo.');
    } else {
      throw error;
    }
  }
}

async function extractTextFromImage(base64Image, mimeType) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{
          parts: [
            { text: "Extract the exact question text from this image. Return only the question, nothing else." },
            { inline_data: { mime_type: mimeType, data: base64Image } }
          ]
        }]
      },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Gemini API quota exceed ho gaya hai. Thodi der baad try karo ya naya API key use karo.');
    } else if (error.response?.status === 400) {
      throw new Error('Image format sahi nahi hai. Dusri image try karo.');
    } else if (error.response?.status === 403) {
      throw new Error('Gemini API key sahi nahi hai. API key check karo.');
    } else {
      throw error;
    }
  }
}

app.post('/api/ask-text', async (req, res) => {
  try {
    const { subject, question } = req.body;
    if (!subject || !question) {
      return res.status(400).json({ error: 'Subject aur question dono zaroori hain.' });
    }
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY configure nahi hai.' });
    }
    const answer = await callGroq(subject, question);
    res.json({ answer });
  } catch (err) {
    console.error('Text API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Answer lene mein problem hui. Thodi der baad try karo.' });
  }
});

app.post('/api/ask-photo', async (req, res) => {
  try {
    const { subject, image, mimeType } = req.body;
    
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Image data aur mimeType zaroori hain.' });
    }
    
    const finalSubject = subject || 'General';
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY configure nahi hai.' });
    }
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY configure nahi hai.' });
    }

    const extractedQuestion = await extractTextFromImage(image, mimeType);
    const answer = await callGroq(finalSubject, extractedQuestion);

    res.json({ extractedQuestion, answer });
  } catch (err) {
    console.error('Photo API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Photo se question samajhne mein problem hui. Dobara try karo.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chal raha hai port ${PORT} par!`);
});
