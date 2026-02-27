require('dotenv').config();
console.log('Raw GROQ_API_KEY from env:', process.env.GROQ_API_KEY);
console.log('Length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 'undefined');
console.log('First 10 chars:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) : 'undefined');
