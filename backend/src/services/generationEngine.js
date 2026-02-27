const grokService = require('./grokService');
const groqService = require('./groqService');
const { supabase } = require('../utils/supabase');

// Use Groq for testing (faster than Grok)
const aiService = process.env.NODE_ENV === 'development' ? groqService : grokService;

/**
 * Story Generation Engine
 * 
 * Uses a block-based approach where:
 * - Each chapter consists of 2 blocks
 * - After each block, a summary is generated
 * - Subsequent blocks reference all previous summaries for coherence
 * - Character tracking ensures consistency
 * - Plot threads are maintained throughout
 */

class GenerationEngine {
  constructor() {
    this.blockSummaries = [];
    this.characterStates = new Map();
    this.plotThreads = [];
    this.totalWordCount = 0;
  }

  /**
   * Initialize a new story generation
   */
  async initializeStory(storyConfig) {
    this.storyConfig = storyConfig;
    this.blockSummaries = [];
    this.characterStates = new Map();
    this.plotThreads = [];
    this.totalWordCount = 0;

    // Initialize character tracking
    if (storyConfig.characters) {
      storyConfig.characters.forEach(char => {
        this.characterStates.set(char.name, {
          name: char.name,
          description: char.description,
          arc: char.arc || 'Supporting',
          currentState: 'Introduced',
          relationships: new Map()
        });
      });
    }

    // Initialize plot threads from events
    if (storyConfig.events) {
      this.plotThreads = storyConfig.events.map((event, idx) => ({
        id: idx,
        description: event,
        status: 'pending',
        introducedIn: null,
        resolvedIn: null
      }));
    }

    return this;
  }

  /**
   * Generate the complete story
   */
  async generateStory(storyId, onProgress) {
    const { storyType, packageType, targetWordCount } = this.storyConfig;
    
    // Calculate blocks needed
    const wordsPerBlock = 500;
    const totalBlocks = Math.ceil(targetWordCount / wordsPerBlock);
    const chaptersCount = Math.ceil(totalBlocks / 2);

    const story = {
      id: storyId,
      title: this.storyConfig.title || 'Untitled',
      chapters: [],
      metadata: {
        wordCount: 0,
        chaptersCount,
        blocksCount: totalBlocks,
        packageType,
        storyType
      }
    };

    // Generate title page content
    story.titlePage = await this.generateTitlePage();

    // Generate table of contents structure
    story.tableOfContents = [];

    // Generate back cover blurb
    story.backCover = await this.generateBackCover();

    // Generate each chapter
    for (let chapterNum = 1; chapterNum <= chaptersCount; chapterNum++) {
      if (onProgress) {
        onProgress({
          stage: 'chapter',
          current: chapterNum,
          total: chaptersCount,
          message: `Generating Chapter ${chapterNum}...`
        });
      }

      const chapter = await this.generateChapter(chapterNum, chaptersCount);
      story.chapters.push(chapter);
      story.tableOfContents.push({
        number: chapterNum,
        title: chapter.title,
        wordCount: chapter.wordCount
      });

      // Update total word count
      story.metadata.wordCount += chapter.wordCount;

      // Save progress to database
      await this.saveProgress(storyId, story);
    }

    // Generate about the author for premium
    if (packageType === 'premium' && this.storyConfig.authorInfo) {
      story.aboutAuthor = await this.generateAboutAuthor();
    }

    // Generate illustrations for premium
    if (packageType === 'premium') {
      story.illustrations = await this.generateIllustrations(story);
    }

    return story;
  }

  /**
   * Generate a single chapter (2 blocks)
   */
  async generateChapter(chapterNum, totalChapters) {
    const blocks = [];
    let chapterWordCount = 0;

    // Generate 2 blocks per chapter
    for (let blockNum = 1; blockNum <= 2; blockNum++) {
      const globalBlockNum = (chapterNum - 1) * 2 + blockNum;
      
      const block = await this.generateBlock(globalBlockNum, chapterNum, blockNum, totalChapters);
      blocks.push(block);
      chapterWordCount += block.wordCount;

      // Generate and store summary
      const summary = await this.generateBlockSummary(block);
      this.blockSummaries.push({
        blockNum: globalBlockNum,
        chapterNum,
        summary,
        keyEvents: block.keyEvents,
        characterDevelopments: block.characterDevelopments
      });
    }

    // Generate chapter title
    const chapterTitle = await this.generateChapterTitle(blocks);

    return {
      number: chapterNum,
      title: chapterTitle,
      blocks,
      wordCount: chapterWordCount,
      content: blocks.map(b => b.content).join('\n\n')
    };
  }

  /**
   * Generate a single block of content
   */
  async generateBlock(globalBlockNum, chapterNum, blockNum, totalChapters) {
    const prompt = this.buildBlockPrompt(globalBlockNum, chapterNum, blockNum, totalChapters);
    
    const systemPrompt = this.buildSystemPrompt();

    const response = await aiService.generateText(prompt, {
      systemPrompt,
      temperature: 0.85,
      maxTokens: 2500
    });

    const content = response.text;
    const wordCount = content.split(/\s+/).length;

    // Extract key events from the block
    const keyEvents = await this.extractKeyEvents(content);
    
    // Track character developments
    const characterDevelopments = await this.trackCharacterDevelopments(content);

    return {
      number: blockNum,
      content,
      wordCount,
      keyEvents,
      characterDevelopments
    };
  }

  /**
   * Build the prompt for a block
   */
  buildBlockPrompt(globalBlockNum, chapterNum, blockNum, totalChapters) {
    const { 
      storyType, 
      brief, 
      genre, 
      themes, 
      tone, 
      writingStyle,
      setting,
      recurringSentiments
    } = this.storyConfig;

    // Build context from previous summaries
    const contextSummary = this.buildContextSummary();
    
    // Determine which plot threads to address
    const activeThreads = this.getActivePlotThreads(globalBlockNum);

    // Calculate progress
    const progress = Math.round((globalBlockNum / (totalChapters * 2)) * 100);

    let prompt = `Write Block ${blockNum} of Chapter ${chapterNum} for a ${storyType}.

STORY BRIEF: ${brief}
GENRE: ${genre || 'General Fiction'}
${themes ? `THEMES: ${themes.join(', ')}` : ''}
${tone ? `TONE: ${tone}` : ''}
${writingStyle ? `WRITING STYLE: ${writingStyle}` : ''}
${setting ? `SETTING: ${setting}` : ''}
${recurringSentiments ? `RECURRING SENTIMENTS: ${recurringSentiments}` : ''}

PROGRESS: ${progress}% through the story
`;

    // Add character information
    if (this.characterStates.size > 0) {
      prompt += `\nCHARACTERS:\n`;
      this.characterStates.forEach((char, name) => {
        prompt += `- ${name}: ${char.description} (Current state: ${char.currentState})\n`;
      });
    }

    // Add context from previous blocks
    if (contextSummary) {
      prompt += `\nPREVIOUS EVENTS SUMMARY:\n${contextSummary}\n`;
    }

    // Add active plot threads
    if (activeThreads.length > 0) {
      prompt += `\nPLOT THREADS TO ADDRESS:\n`;
      activeThreads.forEach(thread => {
        prompt += `- ${thread.description} (${thread.status})\n`;
      });
    }

    // Add specific instructions based on position
    if (globalBlockNum === 1) {
      prompt += `\nThis is the OPENING. Hook the reader immediately. Introduce the main character(s) and establish the setting. Create intrigue or tension.`;
    } else if (globalBlockNum === totalChapters * 2) {
      prompt += `\nThis is the CONCLUSION. Resolve the main conflict(s). Provide satisfying closure while staying true to the tone. Tie up loose ends.`;
    } else if (blockNum === 1) {
      prompt += `\nThis is a CHAPTER OPENING. Transition smoothly from the previous chapter. Set up the scene and goals for this chapter.`;
    } else {
      prompt += `\nThis is a CHAPTER CONTINUATION. Build on the previous block. Advance the plot or develop characters. Create momentum.`;
    }

    prompt += `\n\nWrite approximately 400-600 words. Focus on quality storytelling, vivid descriptions, and engaging dialogue. Maintain narrative voice consistency.`;

    return prompt;
  }

  /**
   * Build system prompt for consistent writing
   */
  buildSystemPrompt() {
    const { writingStyle, tone, genre } = this.storyConfig;
    
    let prompt = `You are an expert creative writer specializing in ${genre || 'fiction'}. `;
    
    if (writingStyle) {
      prompt += `Write in the style of ${writingStyle}. `;
    }
    
    if (tone) {
      prompt += `Maintain a ${tone} tone throughout. `;
    }
    
    prompt += `Create engaging, professional-quality prose with:
- Show, don't tell - use vivid sensory details
- Natural, character-revealing dialogue
- Pacing that serves the story
- Consistent point of view
- No clichés or purple prose
- Proper paragraph structure
- Authentic emotional resonance

Output only the story content. No meta-commentary, no chapter headings within the block, no "Block X" labels.`;

    return prompt;
  }

  /**
   * Build summary of previous blocks for context
   */
  buildContextSummary() {
    if (this.blockSummaries.length === 0) return '';

    // Include last 3 summaries for context (adjustable)
    const recentSummaries = this.blockSummaries.slice(-3);
    
    return recentSummaries.map((s, idx) => 
      `Block ${s.blockNum}: ${s.summary}`
    ).join('\n');
  }

  /**
   * Get active plot threads for current position
   */
  getActivePlotThreads(blockNum) {
    const totalBlocks = this.storyConfig.targetWordCount / 500;
    
    return this.plotThreads.filter(thread => {
      // Distribute threads throughout the story
      const introPoint = Math.floor((thread.id / this.plotThreads.length) * totalBlocks * 0.3);
      const resolvePoint = Math.floor(introPoint + (totalBlocks * 0.5));
      
      if (blockNum >= introPoint && !thread.introducedIn) {
        thread.introducedIn = blockNum;
        thread.status = 'active';
        return true;
      }
      
      if (blockNum >= resolvePoint && thread.status === 'active' && !thread.resolvedIn) {
        thread.resolvedIn = blockNum;
        thread.status = 'resolving';
        return true;
      }
      
      return thread.status === 'active' || thread.status === 'resolving';
    });
  }

  /**
   * Generate summary of a block
   */
  async generateBlockSummary(block) {
    const prompt = `Summarize the following story block in 2-3 sentences. Focus on key plot developments, character actions, and emotional beats:

${block.content.substring(0, 1000)}...`;

    const response = await aiService.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 150
    });

    return response.text.trim();
  }

  /**
   * Extract key events from block content
   */
  async extractKeyEvents(content) {
    const prompt = `List the 2-3 most important events in this story excerpt. Be brief:

${content.substring(0, 800)}`;

    const response = await aiService.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 100
    });

    return response.text.trim().split('\n').filter(e => e.trim());
  }

  /**
   * Track character developments in block
   */
  async trackCharacterDevelopments(content) {
    const developments = [];
    
    this.characterStates.forEach((char, name) => {
      if (content.toLowerCase().includes(name.toLowerCase())) {
        developments.push({
          character: name,
          action: 'appears'
        });
      }
    });

    return developments;
  }

  /**
   * Generate chapter title
   */
  async generateChapterTitle(blocks) {
    const combinedContent = blocks.map(b => b.content).join('\n\n').substring(0, 1500);
    
    const prompt = `Create a compelling chapter title (3-7 words) for this chapter:

${combinedContent}

Title only, no quotes.`;

    const response = await aiService.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 50
    });

    return response.text.trim().replace(/["']/g, '');
  }

  /**
   * Generate title page content
   */
  async generateTitlePage() {
    const { title, subtitle, authorName, genre } = this.storyConfig;
    
    return {
      title: title || 'Untitled',
      subtitle: subtitle || '',
      author: authorName || 'Anonymous',
      genre: genre || 'Fiction'
    };
  }

  /**
   * Generate back cover blurb
   */
  async generateBackCover() {
    const { brief, title, themes, tone } = this.storyConfig;
    
    const prompt = `Write a compelling back cover blurb (100-150 words) for this book:

Title: ${title || 'Untitled'}
Premise: ${brief}
${themes ? `Themes: ${themes.join(', ')}` : ''}
${tone ? `Tone: ${tone}` : ''}

Write an engaging, professional blurb that hooks potential readers without giving away major spoilers. Use present tense.`;

    const response = await aiService.generateText(prompt, {
      temperature: 0.8,
      maxTokens: 300
    });

    return response.text.trim();
  }

  /**
   * Generate about the author section
   */
  async generateAboutAuthor() {
    const { authorInfo } = this.storyConfig;
    
    if (!authorInfo) return null;

    const prompt = `Write a professional "About the Author" section (100-150 words) for:

Name: ${authorInfo.name || 'Anonymous'}
Bio: ${authorInfo.bio || 'A passionate storyteller.'}
${authorInfo.location ? `Location: ${authorInfo.location}` : ''}
${authorInfo.website ? `Website: ${authorInfo.website}` : ''}

Write in third person, professional but approachable tone.`;

    const response = await aiService.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 250
    });

    return {
      text: response.text.trim(),
      imageUrl: authorInfo.imageUrl || null
    };
  }

  /**
   * Generate illustrations for premium package
   */
  async generateIllustrations(story) {
    const illustrations = [];
    
    // Generate cover illustration
    const coverPrompt = `Book cover illustration for "${story.title}": ${this.storyConfig.brief}. ${this.storyConfig.genre || 'Fiction'} style, professional, cinematic.`;
    
    try {
      // Use Grok for image generation (Groq doesn't support images)
      const coverImage = await grokService.generateImage(coverPrompt);
      illustrations.push({
        type: 'cover',
        url: coverImage.url,
        description: 'Cover illustration'
      });
    } catch (error) {
      console.error('Cover generation failed:', error);
    }

    // Generate chapter illustrations (every 3 chapters)
    for (let i = 0; i < story.chapters.length; i += 3) {
      const chapter = story.chapters[i];
      const chapterPrompt = `Illustration for chapter "${chapter.title}" from "${story.title}": ${chapter.content.substring(0, 300)}... ${this.storyConfig.genre || 'Fiction'} style.`;
      
      try {
        // Use Grok for image generation (Groq doesn't support images)
        const chapterImage = await grokService.generateImage(chapterPrompt);
        illustrations.push({
          type: 'chapter',
          chapter: chapter.number,
          url: chapterImage.url,
          description: `Chapter ${chapter.number} illustration`
        });
      } catch (error) {
        console.error(`Chapter ${chapter.number} illustration failed:`, error);
      }
    }

    return illustrations;
  }

  /**
   * Save generation progress to database
   */
  async saveProgress(storyId, story) {
    try {
      await supabase
        .from('stories')
        .update({
          content: story,
          progress: {
            chaptersCompleted: story.chapters.length,
            wordCount: story.metadata.wordCount,
            lastUpdated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Regenerate a specific section (premium feature)
   */
  async regenerateSection(storyId, chapterNum, blockNum, instructions) {
    // Load existing story
    const { data: story } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (!story) throw new Error('Story not found');

    // Reinitialize engine with story config
    await this.initializeStory(story.config);
    
    // Load existing summaries up to the block before target
    const targetBlockNum = (chapterNum - 1) * 2 + blockNum;
    
    // Generate new block with specific instructions
    const prompt = this.buildBlockPrompt(targetBlockNum, chapterNum, blockNum, story.content.chapters.length);
    
    const modifiedPrompt = `${prompt}\n\nSPECIAL INSTRUCTIONS FOR THIS REGENERATION: ${instructions}`;

    const systemPrompt = this.buildSystemPrompt();

    const response = await aiService.generateText(modifiedPrompt, {
      systemPrompt,
      temperature: 0.9, // Slightly higher for variation
      maxTokens: 2500
    });

    // Update the story content
    const newContent = response.text;
    const newWordCount = newContent.split(/\s+/).length;

    story.content.chapters[chapterNum - 1].blocks[blockNum - 1].content = newContent;
    story.content.chapters[chapterNum - 1].blocks[blockNum - 1].wordCount = newWordCount;
    
    // Recalculate chapter content
    story.content.chapters[chapterNum - 1].content = 
      story.content.chapters[chapterNum - 1].blocks.map(b => b.content).join('\n\n');

    // Save updated story
    await this.saveProgress(storyId, story.content);

    return {
      chapterNum,
      blockNum,
      newContent,
      newWordCount
    };
  }
}

const engine = new GenerationEngine();
module.exports = engine;
