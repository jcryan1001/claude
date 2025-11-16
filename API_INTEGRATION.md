# API Integration Guide

This document explains how to integrate real APIs for the voice-to-voice chat interface.

## Overview

The app has three placeholder API functions in `src/App.jsx` that need to be connected to real services:

1. **callLLMAPI** - Language Model for generating responses
2. **textToSpeech** - Convert AI text responses to speech
3. **voiceToText** - Convert user voice input to text

## 1. LLM API Integration

### Location
`src/App.jsx` - Line 28

### Current Placeholder
```javascript
const callLLMAPI = async (userMessage) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return `AI Response to: "${userMessage}"`
}
```

### Integration Options

#### Option A: OpenAI API
```javascript
const callLLMAPI = async (userMessage) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}
```

#### Option B: Anthropic Claude API
```javascript
const callLLMAPI = async (userMessage) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  return data.content[0].text
}
```

## 2. Text-to-Speech Integration

### Location
`src/App.jsx` - Line 39

### Current Placeholder
```javascript
const textToSpeech = async (text) => {
  console.log('TTS:', text)
  await new Promise(resolve => setTimeout(resolve, 1000))
}
```

### Integration Options

#### Option A: Web Speech API (Browser Built-in - Free)
```javascript
const textToSpeech = async (text) => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = resolve
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    window.speechSynthesis.speak(utterance)
  })
}
```

#### Option B: ElevenLabs API (High Quality)
```javascript
const textToSpeech = async (text) => {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.5 }
    })
  })
  const audioBlob = await response.blob()
  const audio = new Audio(URL.createObjectURL(audioBlob))
  return new Promise(resolve => {
    audio.onended = resolve
    audio.play()
  })
}
```

#### Option C: OpenAI TTS API
```javascript
const textToSpeech = async (text) => {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'alloy'
    })
  })
  const audioBlob = await response.blob()
  const audio = new Audio(URL.createObjectURL(audioBlob))
  return new Promise(resolve => {
    audio.onended = resolve
    audio.play()
  })
}
```

## 3. Voice-to-Text Integration

### Location
`src/App.jsx` - Line 49

### Current Placeholder
```javascript
const voiceToText = async () => {
  console.log('Voice input started...')
  return 'Voice input placeholder'
}
```

### Integration Options

#### Option A: Web Speech API (Browser Built-in - Free)
```javascript
const voiceToText = async () => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }

    recognition.onerror = (event) => {
      reject(event.error)
    }

    recognition.start()
  })
}
```

#### Option B: OpenAI Whisper API
```javascript
const voiceToText = async () => {
  // First, record audio from microphone
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(mediaStream)
  const audioChunks = []

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('model', 'whisper-1')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: formData
      })

      const data = await response.json()
      resolve(data.text)
    }

    mediaRecorder.start()

    // Stop recording after 5 seconds (or add a button to stop)
    setTimeout(() => {
      mediaRecorder.stop()
      mediaStream.getTracks().forEach(track => track.stop())
    }, 5000)
  })
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# ElevenLabs (if using)
REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Important**: Add `.env` to `.gitignore` to keep your API keys secure!

## Quick Start Recommendations

### Free Option (No API Keys Required)
1. **LLM**: Use a local proxy or mock responses for testing
2. **TTS**: Use Web Speech API (Option A)
3. **STT**: Use Web Speech API (Option A)

### Production Option (Best Quality)
1. **LLM**: OpenAI GPT-4 or Anthropic Claude
2. **TTS**: ElevenLabs or OpenAI TTS
3. **STT**: OpenAI Whisper

## State Flow

The app automatically manages AI states during conversation:

1. **Idle** → User types/speaks
2. **Listening** → Receiving input (500ms)
3. **Thinking** → Calling LLM API
4. **Speaking** → Playing TTS response
5. **Idle** → Ready for next input

## Testing

1. Start with Web Speech API for both TTS and STT (no API keys needed)
2. Test the chat interface with text input first
3. Add voice input once text chat is working
4. Upgrade to paid APIs for better quality when ready

## Next Steps

1. Choose your API providers
2. Get API keys and add to `.env`
3. Replace the placeholder functions in `src/App.jsx`
4. Test each function individually
5. Test the full voice-to-voice flow

## Support

If you need help with API integration, check the official docs:
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com
- ElevenLabs: https://elevenlabs.io/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
