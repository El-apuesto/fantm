const axios = require('axios');

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1';

class GrokService {
  constructor() {
    this.client = axios.create({
      baseURL: GROK_API_URL,
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 2 minute timeout for long generations
    });
  }

  /**
   * Generate text using Grok
   */
  async generateText(prompt, options = {}) {
    const {
      model = 'grok-2-1212',
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
      console.error('Grok API error:', error.response?.data || error.message);
      throw new Error(`Generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate an image using Grok Vision (beta)
   */
  async generateImage(prompt, options = {}) {
    const {
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid'
    } = options;

    try {
      const response = await this.client.post('/images/generations', {
        model: 'grok-2-image-1212',
        prompt,
        size,
        quality,
        style,
        n: 1
      });

      return {
        url: response.data.data[0].url,
        revisedPrompt: response.data.data[0].revised_prompt
      };
    } catch (error) {
      console.error('Grok Image API error:', error.response?.data || error.message);
      throw new Error(`Image generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Stream generation for real-time feedback
   */
  async *streamText(prompt, options = {}) {
    const {
      model = 'grok-2-1212',
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
      console.error('Grok stream error:', error.message);
      throw error;
    }
  }
}

module.exports = new GrokService();
