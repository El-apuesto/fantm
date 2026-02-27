const express = require('express');
const { supabase } = require('../utils/supabase');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

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

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    // Get story stats
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    const { count: completedStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'completed');

    res.json({
      profile: data,
      stats: {
        totalStories,
        completedStories
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, bio, website, location } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name,
        bio,
        website,
        location,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, profile: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload avatar
router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Supabase Storage
    const fileBuffer = require('fs').readFileSync(req.file.path);
    const fileName = `avatars/${req.user.id}/${Date.now()}-${req.file.filename}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('fantmink')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('fantmink')
      .getPublicUrl(fileName);

    // Update profile
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', req.user.id);

    // Clean up temp file
    require('fs').unlinkSync(req.file.path);

    res.json({
      success: true,
      avatarUrl: publicUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's stories with stats
router.get('/stories', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by status
    const grouped = {
      draft: data.filter(s => s.status === 'draft'),
      generating: data.filter(s => s.status === 'generating'),
      completed: data.filter(s => s.status === 'completed'),
      error: data.filter(s => s.status === 'error')
    };

    res.json({
      stories: data,
      grouped,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auto-save data
router.get('/autosave/:storyId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('autosaves')
      .select('*')
      .eq('story_id', req.params.storyId)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      exists: !!data,
      data: data?.content || null,
      savedAt: data?.created_at || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save auto-save data
router.post('/autosave/:storyId', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    // Upsert auto-save
    const { data, error } = await supabase
      .from('autosaves')
      .upsert({
        story_id: req.params.storyId,
        user_id: req.user.id,
        content,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'story_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, savedAt: data.created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
