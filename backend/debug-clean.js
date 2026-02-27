require('dotenv').config();
const cleanKey = process.env.GROQ_API_KEY.trim();
console.log('Clean key:', cleanKey);
console.log('Clean length:', cleanKey.length);

// Test with clean key
const axios = require('axios');

async function testCleanKey() {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say "test successful"' }],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API call successful:', response.data.choices[0].message.content);
  } catch (error) {
    console.log('❌ API error:', error.response?.data || error.message);
  }
}

testCleanKey();
