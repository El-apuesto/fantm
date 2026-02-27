const groqService = require('./src/services/groqService');

async function testGroq() {
  try {
    console.log('Testing Groq API...');
    
    const response = await groqService.generateText(
      'Write a short story opening (about 100 words) about a detective who discovers a mysterious AI.',
      {
        temperature: 0.8,
        maxTokens: 150
      }
    );
    
    console.log('✅ Groq test successful!');
    console.log('Generated text:', response.text);
    console.log('Model used:', response.model);
    console.log('Tokens used:', response.usage);
    
  } catch (error) {
    console.error('❌ Groq test failed:', error.message);
  }
}

testGroq();
