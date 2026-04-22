# AI Doubt Solver

A mobile-first AI-powered doubt solving application specifically designed for Indian students, featuring voice input, photo upload, and multilingual support.

## Features

### Core Functionality
- **Text-based doubt solving**: Ask questions in Hindi, English, or Hinglish
- **Photo-based doubt solving**: Upload images of textbook problems or questions
- **Voice input**: Speak your doubts in Hindi
- **Text-to-speech**: Listen to AI-generated answers
- **Save doubts**: Store and review solved doubts locally

### UI/UX Features
- **Mobile-first design**: Optimized for phone screens
- **Indian flag colors**: Saffron (#FF9933), White, and Green (#138808) theme
- **Subject selector**: Dropdown with 8 subjects
- **Large, readable fonts**: Easy to read on small screens
- **Smooth animations**: Modern micro-interactions
- **No login required**: Instant access to all features

## Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for API calls
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Frontend
- **Plain HTML + CSS + JavaScript** - No React, pure web technologies
- **Speech Recognition API** - Voice input functionality
- **Text-to-Speech API** - Answer playback
- **Local Storage** - Save solved doubts

### AI Integration
- **Groq API** (llama-3.3-70b-versatile) - Text-based AI responses
- **Gemini Vision API** (gemini-2.0-flash) - Image text extraction

## Project Structure

```
AI Doubt Solver/
|
|-- server.js              # Main Express server
|-- package.json            # Dependencies and scripts
|-- .env                    # Environment variables (API keys)
|-- README.md               # This file
|
|-- public/                 # Frontend assets
|   |-- index.html          # Mobile-first UI
|   |-- style.css           # Indian flag color scheme
|   |-- app.js              # Frontend functionality
|
|-- node_modules/           # Dependencies
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI Doubt Solver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the application**
   Navigate to `http://localhost:3000` in your browser.

## API Endpoints

### POST /api/ask-text
Ask text-based questions to the AI.

**Request Body:**
```json
{
  "subject": "Physics",
  "question": "Newton ka pehla niyam kya hai?"
}
```

**Response:**
```json
{
  "answer": "Newton ka pehla niyam hai ki koi bhi object jab rest mein hai..."
}
```

### POST /api/ask-photo
Upload images for text extraction and AI answering.

**Request Body:**
```json
{
  "subject": "Mathematics",
  "base64Image": "base64_encoded_image_string",
  "mimeType": "image/jpeg",
  "question": "Additional text question (optional)"
}
```

**Response:**
```json
{
  "extractedQuestion": "Solve the equation: 2x + 5 = 15",
  "answer": "Step 1: 2x + 5 = 15\nStep 2: 2x = 15 - 5\nStep 3: 2x = 10\nStep 4: x = 10/2\nStep 5: x = 5"
}
```

## Usage Guide

### For Students

1. **Select Subject**: Choose your subject from the dropdown menu
2. **Input Your Doubt**: 
   - Type your question in the text box
   - OR click "Bol ke poocho" to speak your doubt
   - OR click "Photo se poocho" to upload an image
3. **Get Answer**: Click the "Jawab Do" button
4. **Review Answer**: Read the step-by-step solution
5. **Listen**: Click "Suno" to hear the answer
6. **Save**: Click "Save karo" to save for later review

### Supported Subjects
- Physics (Bhautiki)
- Chemistry (Rasayan Vigyan)
- Mathematics (Ganit)
- Biology (Jeev Vigyan)
- History (Itihas)
- Geography (Bhugol)
- Economics (Arthashastra)
- Social Science (Samajik Vigyan)

### Supported Languages
- Hindi
- English
- Hinglish (Hindi + English mix)

## API Keys Setup

### Groq API
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up and create an API key
3. Add it to your `.env` file as `GROQ_API_KEY`

### Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key for Gemini
3. Add it to your `.env` file as `GEMINI_API_KEY`

## Mobile Optimization

The application is designed with mobile-first principles:

- **Touch Targets**: All buttons are at least 44px for easy tapping
- **Font Sizes**: Large, readable fonts (18px base)
- **Responsive Design**: Optimized for screens 480px and below
- **Scroll Behavior**: Smooth scrolling with scroll-snap for subject selection
- **Input Methods**: Supports voice, text, and photo input
- **Performance**: Fast loading and smooth animations

## Browser Support

- **Chrome**: Full support (recommended)
- **Safari**: Full support
- **Firefox**: Full support
- **Edge**: Full support

**Note**: Voice recognition works best in Chrome on Android devices.

## Development

### Scripts
```bash
npm start      # Start the development server
npm run dev    # Alias for npm start
npm run build  # Build command (placeholder)
```

### File Structure Details

- **server.js**: Express server with API routes and AI integration
- **public/index.html**: Mobile-first HTML structure
- **public/style.css**: CSS with Indian flag colors and responsive design
- **public/app.js**: Frontend JavaScript with voice recognition and API calls

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Troubleshooting

### Common Issues

**Voice input not working:**
- Ensure you're using Chrome browser
- Grant microphone permissions when prompted
- Check if your device has a working microphone

**Photo upload not working:**
- Ensure image file is under 10MB
- Supported formats: JPEG, PNG, WebP
- Check your internet connection

**API errors:**
- Verify your API keys in the `.env` file
- Check your internet connection
- Ensure API keys have sufficient credits

**Server not starting:**
- Check if port 3000 is available
- Run `npm install` to install dependencies
- Check for any syntax errors in `.env` file

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Groq** - For providing the Llama model API
- **Google** - For the Gemini Vision API
- **Indian Students** - Inspiration for this project

## Contact

For questions, suggestions, or issues, please open an issue on the GitHub repository.

---

**Jai Hind! Made with for Indian Students**
