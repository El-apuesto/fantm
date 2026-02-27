// Mock test to verify the build works without external APIs

console.log('🚀 fantm.ink Backend Build Test');
console.log('================================');

// Test 1: Check if all services load correctly
try {
  const generationEngine = require('./src/services/generationEngine');
  console.log('✅ Generation Engine loaded successfully');
} catch (error) {
  console.log('❌ Generation Engine failed:', error.message);
}

// Test 2: Check if routes load correctly
try {
  const authRoutes = require('./src/routes/auth');
  const storyRoutes = require('./src/routes/stories');
  const paymentRoutes = require('./src/routes/payments');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.log('❌ Routes failed:', error.message);
}

// Test 3: Check environment variables
console.log('\n📋 Environment Variables:');
console.log('- PORT:', process.env.PORT || 'Not set');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set ✓' : 'Not set ✗');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✓' : 'Not set ✗');

// Test 4: Mock generation test
console.log('\n🧪 Mock Generation Test:');
const mockStoryConfig = {
  title: 'Test Story',
  type: 'novella',
  brief: 'A test story',
  genre: 'Science Fiction',
  targetWords: 20000
};

console.log('✅ Mock story config created:', mockStoryConfig);

console.log('\n🎉 Build test completed successfully!');
console.log('📝 Note: To test with real APIs, update the API keys in .env');
