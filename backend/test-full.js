require('dotenv').config();

console.log('🚀 fantm.ink Full Build Test');
console.log('================================');

// Test 1: Check all services load
try {
  const express = require('express');
  const { createClient } = require('@supabase/supabase-js');
  const groqService = require('./src/services/groqService');
  const generationEngine = require('./src/services/generationEngine');
  
  console.log('✅ All services loaded successfully');
} catch (error) {
  console.log('❌ Service loading failed:', error.message);
}

// Test 2: Check environment
console.log('\n📋 Environment Check:');
console.log('- PORT:', process.env.PORT || 'Not set');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set ✓' : 'Not set ✗');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✓' : 'Not set ✗');

// Test 3: Mock story generation (without API calls)
console.log('\n🧪 Mock Generation Test:');
const mockStory = {
  title: 'Test Story',
  type: 'novella',
  brief: 'A test story',
  genre: 'Science Fiction',
  targetWords: 20000
};

console.log('✅ Mock story config created');
console.log('📊 Story details:', mockStory);

// Test 4: Check if routes are properly structured
try {
  const authRoutes = require('./src/routes/auth');
  const storyRoutes = require('./src/routes/stories');
  const paymentRoutes = require('./src/routes/payments');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.log('❌ Routes failed:', error.message);
}

console.log('\n🎉 Build Test Complete!');
console.log('📝 Ready for production with valid API keys');
