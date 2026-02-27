require('dotenv').config();
const axios = require('axios');

async function testModel() {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Model works:', response.data.model);
  } catch (error) {
    console.log('❌ Model error:', error.response?.data);
  }
}

testModel();
