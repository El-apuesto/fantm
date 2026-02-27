const express = require('express');
const { supabase } = require('../utils/supabase');
const GenerationEngine = require('../services/generationEngine');
const pdfService = require('../services/pdfService');
const router = express.Router();

// Middleware to verify auth token
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Start story generation
router.post('/start/:storyId', requireAuth, async (req, res) => {
  try {
    const { storyId } = req.params;

    // Get story config
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if already generating
    if (story.status === 'generating') {
      return res.status(409).json({ error: 'Story is already being generated' });
    }

    // Update status
    await supabase
      .from('stories')
      .update({
        status: 'generating',
        progress: { stage: 'initializing', percent: 0 },
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);

    // Start generation in background
    const engine = new GenerationEngine();
    await engine.initializeStory(story);

    // Update status to generating
    res.json({
      success: true,
      message: 'Generation started',
      storyId
    });

    // Continue generation asynchronously
    generateStoryAsync(storyId, engine, story);

  } catch (error) {
    console.error('Generation start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Async generation function
async function generateStoryAsync(storyId, engine, storyConfig) {
  try {
    const story = await engine.generateStory(storyId, async (progress) => {
      // Update progress in database
      await supabase
        .from('stories')
        .update({
          progress: {
            stage: progress.stage,
            current: progress.current,
            total: progress.total,
            message: progress.message,
            percent: Math.round((progress.current / progress.total) * 100)
          }
        })
        .eq('id', storyId);
    });

    // Generate PDF
    const pdfResult = await pdfService.generateBook(story, {
      includeIllustrations: storyConfig.package_type === 'premium',
      format: storyConfig.package_type === 'premium' ? 'premium' : 'standard',
      authorImage: storyConfig.author_info?.imageUrl
    });

    // Update story with completed status
    await supabase
      .from('stories')
      .update({
        status: 'completed',
        content: story,
        pdf_url: pdfResult.url,
        progress: { stage: 'completed', percent: 100 },
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);

    console.log(`✅ Story ${storyId} generation completed`);

  } catch (error) {
    console.error('Generation error:', error);
    
    await supabase
      .from('stories')
      .update({
        status: 'error',
        error: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);
  }
}

// Get generation progress
router.get('/progress/:storyId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('status, progress, error, pdf_url, completed_at')
      .eq('id', req.params.storyId)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      status: data.status,
      progress: data.progress,
      error: data.error,
      pdfUrl: data.pdf_url,
      completedAt: data.completed_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regenerate a section (premium feature)
router.post('/regenerate/:storyId', requireAuth, async (req, res) => {
  try {
    const { storyId } = req.params;
    const { chapterNum, blockNum, instructions } = req.body;

    // Get story
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if premium
    if (story.package_type !== 'premium') {
      return res.status(403).json({ error: 'Regeneration is a premium feature' });
    }

    // Check regeneration limit
    const regenerationCount = story.regeneration_count || 0;
    const maxRegenerations = 5; // 5 regenerations per story

    if (regenerationCount >= maxRegenerations) {
      return res.status(403).json({
        error: 'Regeneration limit reached',
        message: `You have used all ${maxRegenerations} regenerations for this story`
      });
    }

    // Perform regeneration
    const engine = new GenerationEngine();
    const result = await engine.regenerateSection(storyId, chapterNum, blockNum, instructions);

    // Update regeneration count
    await supabase
      .from('stories')
      .update({
        regeneration_count: regenerationCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);

    // Regenerate PDF
    const updatedStory = await supabase
      .from('stories')
      .select('content, package_type, author_info')
      .eq('id', storyId)
      .single();

    const pdfResult = await pdfService.generateBook(updatedStory.data.content, {
      includeIllustrations: true,
      format: 'premium',
      authorImage: updatedStory.data.author_info?.imageUrl
    });

    await supabase
      .from('stories')
      .update({ pdf_url: pdfResult.url })
      .eq('id', storyId);

    res.json({
      success: true,
      result,
      regenerationCount: regenerationCount + 1,
      remainingRegenerations: maxRegenerations - regenerationCount - 1
    });

  } catch (error) {
    console.error('Regeneration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stream generation (WebSocket alternative)
router.get('/stream/:storyId', requireAuth, async (req, res) => {
  try {
    const { storyId } = req.params;

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial message
    res.write(`data: ${JSON.stringify({ type: 'connected', storyId })}\n\n`);

    // Poll for progress
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('status, progress, error, pdf_url')
          .eq('id', storyId)
          .eq('user_id', req.user.id)
          .single();

        if (error) {
          res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
          clearInterval(interval);
          res.end();
          return;
        }

        res.write(`data: ${JSON.stringify({
          type: 'progress',
          status: data.status,
          progress: data.progress,
          error: data.error,
          pdfUrl: data.pdf_url
        })}\n\n`);

        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval);
          res.end();
        }
      } catch (err) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 2000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
