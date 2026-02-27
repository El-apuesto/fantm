require('dotenv').config();
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;
const GROQ_API_URL = 'https://api.groq.com/openai/v1';

class GroqService {
  constructor() {
    this.client = axios.create({
      baseURL: GROQ_API_URL,
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 2 minute timeout for long generations
    });
  }

  /**
   * Generate text using Groq (for testing - faster than Grok)
   */
  async generateText(prompt, options = {}) {
    const {
      model = 'llama-3.3-70b-versatile',
      temperature = 0.8,
      maxTokens = 4000,
      systemPrompt = null
    } = options;

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      });

      return {
        text: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      console.error('Groq API error:', error.response?.data || error.message);
      throw new Error(`Generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate an image using Groq (not supported - fallback to Grok)
   */
  async generateImage(prompt, options = {}) {
    throw new Error('Image generation not supported by Groq. Use Grok service for images.');
  }

  /**
   * Stream generation for real-time feedback
   */
  async *streamText(prompt, options = {}) {
    const {
      model = 'llama-3.3-70b-versatile',
      temperature = 0.8,
      maxTokens = 4000,
      systemPrompt = null
    } = options;

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true
      }, {
        responseType: 'stream'
      });

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Groq stream error:', error.message);
      throw error;
    }
  }
}

module.exports = new GroqService();
