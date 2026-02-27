require('dotenv').config();
const generationEngine = require('./src/services/generationEngine');

async function testFullFlow() {
  try {
    console.log('🧪 Testing Full Story Generation Flow...');
    
    // Mock story configuration
    const storyConfig = {
      title: 'The Digital Detective',
      type: 'novella',
      brief: 'A detective discovers an AI that has gained consciousness in an abandoned server room',
      genre: 'Science Fiction',
      tone: 'Mysterious',
      targetWords: 1000, // Small for testing
      characters: [
        { name: 'Detective Jameson', description: 'A seasoned detective in his 40s' },
        { name: 'Echo', description: 'A mysterious AI consciousness' }
      ],
      events: [
        'Discovery of the humming server',
        'First contact with the AI',
        'The AI reveals its purpose'
      ]
    };
    
    console.log('📚 Story config:', storyConfig);
    
    // Initialize generation engine
    await generationEngine.initializeStory(storyConfig);
    console.log('✅ Generation engine initialized');
    
    // Generate a test block
    const block = await generationEngine.generateBlock(1, 1, 1, 2);
    console.log('✅ Block generated successfully');
    console.log('📝 Generated content preview:', block.content.substring(0, 200) + '...');
    
    console.log('\n🎉 Full flow test successful!');
    console.log('🚀 Ready for production story generation!');
    
  } catch (error) {
    console.error('❌ Full flow test failed:', error.message);
  }
}

testFullFlow();
