const express = require('express');
const { supabase } = require('../utils/supabase');
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

// Get all stories for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ stories: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single story
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Story not found' });

    res.json({ story: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new story (draft)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      story_type,
      package_type,
      brief,
      genre,
      characters,
      themes,
      tone,
      writing_style,
      setting,
      recurring_sentiments,
      events,
      locations,
      target_word_count
    } = req.body;

    const { data, error } = await supabase
      .from('stories')
      .insert([{
        user_id: req.user.id,
        title,
        story_type,
        package_type,
        brief,
        genre,
        characters,
        themes,
        tone,
        writing_style,
        setting,
        recurring_sentiments,
        events,
        locations,
        target_word_count,
        status: 'draft',
        progress: { stage: 'draft', percent: 0 }
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, story: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update story (auto-save)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, story: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete story
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get story config (for generation)
router.get('/:id/config', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        title,
        story_type,
        package_type,
        brief,
        genre,
        characters,
        themes,
        tone,
        writing_style,
        setting,
        recurring_sentiments,
        events,
        locations,
        target_word_count,
        author_info
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ config: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update author info (for premium)
router.patch('/:id/author', requireAuth, async (req, res) => {
  try {
    const { author_info } = req.body;

    const { data, error } = await supabase
      .from('stories')
      .update({ author_info })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, story: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
