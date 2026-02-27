const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../uploads/pdfs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate a complete PDF book
   */
  async generateBook(story, options = {}) {
    const { 
      includeIllustrations = false, 
      format = 'standard',
      authorImage = null 
    } = options;

    const doc = new PDFDocument({
      size: format === 'premium' ? 'A5' : 'A4',
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72
      }
    });

    const filename = `${story.id}_${Date.now()}.pdf`;
    const filepath = path.join(this.outputDir, filename);
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Add fonts
    doc.registerFont('Title', 'Times-Bold');
    doc.registerFont('Heading', 'Helvetica-Bold');
    doc.registerFont('Body', 'Times-Roman');
    doc.registerFont('BodyItalic', 'Times-Italic');

    // 1. Title Page
    await this.addTitlePage(doc, story);

    // 2. Copyright Page
    this.addCopyrightPage(doc, story);

    // 3. Table of Contents
    this.addTableOfContents(doc, story);

    // 4. Dedication (if provided)
    if (story.dedication) {
      this.addDedicationPage(doc, story.dedication);
    }

    // 5. Chapters
    for (let i = 0; i < story.chapters.length; i++) {
      const chapter = story.chapters[i];
      
      // Add chapter illustration for premium
      if (includeIllustrations && story.illustrations) {
        const chapterIllustration = story.illustrations.find(
          ill => ill.type === 'chapter' && ill.chapter === chapter.number
        );
        if (chapterIllustration) {
          await this.addIllustrationPage(doc, chapterIllustration);
        }
      }

      this.addChapter(doc, chapter, i === 0);
    }

    // 6. About the Author (premium)
    if (story.aboutAuthor) {
      await this.addAboutAuthorPage(doc, story.aboutAuthor, authorImage);
    }

    // 7. Back Cover Content
    this.addBackCoverPage(doc, story);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          filename,
          filepath,
          url: `/uploads/pdfs/${filename}`
        });
      });
      stream.on('error', reject);
    });
  }

  /**
   * Add title page
   */
  async addTitlePage(doc, story) {
    // Cover illustration for premium
    if (story.illustrations && story.illustrations.find(i => i.type === 'cover')) {
      const coverIll = story.illustrations.find(i => i.type === 'cover');
      try {
        const imageBuffer = await this.downloadImage(coverIll.url);
        doc.image(imageBuffer, 0, 0, {
          fit: [doc.page.width, doc.page.height],
          align: 'center',
          valign: 'center'
        });
        doc.addPage();
      } catch (error) {
        console.error('Failed to add cover image:', error);
      }
    }

    // Title page
    doc.addPage();

    // Decorative top border
    doc.moveTo(72, 100)
       .lineTo(doc.page.width - 72, 100)
       .stroke('#c9a227')
       .lineWidth(2);

    // Title
    doc.font('Title')
       .fontSize(36)
       .fillColor('#1a1a1a');

    const titleY = doc.page.height / 2 - 100;
    doc.text(story.titlePage.title, 72, titleY, {
      align: 'center',
      width: doc.page.width - 144
    });

    // Subtitle
    if (story.titlePage.subtitle) {
      doc.moveDown(1)
         .font('BodyItalic')
         .fontSize(18)
         .fillColor('#666666')
         .text(story.titlePage.subtitle, {
           align: 'center'
         });
    }

    // Author
    doc.moveDown(3)
       .font('Body')
       .fontSize(16)
       .fillColor('#333333')
       .text('by', {
         align: 'center'
       });

    doc.moveDown(0.5)
       .font('Heading')
       .fontSize(20)
       .text(story.titlePage.author, {
         align: 'center'
       });

    // Genre
    doc.moveDown(4)
       .font('BodyItalic')
       .fontSize(12)
       .fillColor('#888888')
       .text(story.titlePage.genre, {
         align: 'center'
       });

    // Decorative bottom border
    doc.moveTo(72, doc.page.height - 100)
       .lineTo(doc.page.width - 72, doc.page.height - 100)
       .stroke('#c9a227')
       .lineWidth(2);
  }

  /**
   * Add copyright page
   */
  addCopyrightPage(doc, story) {
    doc.addPage();

    doc.font('Body')
       .fontSize(10)
       .fillColor('#666666');

    const year = new Date().getFullYear();
    
    doc.text(`Copyright © ${year} ${story.titlePage.author}`, 72, 200);
    doc.moveDown(2);
    
    doc.text('All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.', {
      width: doc.page.width - 144,
      align: 'justify'
    });

    doc.moveDown(3);
    doc.text(`First Edition: ${year}`);
    
    doc.moveDown(1);
    doc.text('Published by fantm.ink');

    doc.moveDown(3);
    doc.text('ISBN: [To be assigned]', { align: 'center' });

    doc.moveDown(2);
    doc.text('This is a work of fiction. Names, characters, businesses, places, events, and incidents are either the products of the author\'s imagination or used in a fictitious manner. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.', {
      width: doc.page.width - 144,
      align: 'justify',
      oblique: true
    });
  }

  /**
   * Add table of contents
   */
  addTableOfContents(doc, story) {
    doc.addPage();

    doc.font('Heading')
       .fontSize(24)
       .fillColor('#1a1a1a')
       .text('Contents', 72, 72, { align: 'center' });

    doc.moveTo(100, 110)
       .lineTo(doc.page.width - 100, 110)
       .stroke('#c9a227')
       .lineWidth(1);

    let y = 140;
    
    doc.font('Body')
       .fontSize(12)
       .fillColor('#333333');

    story.tableOfContents.forEach((chapter, index) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 72;
      }

      // Chapter number and title
      doc.text(`Chapter ${chapter.number}: ${chapter.title}`, 72, y, {
        width: doc.page.width - 200,
        continued: true
      });

      // Dots
      const textWidth = doc.widthOfString(`Chapter ${chapter.number}: ${chapter.title}`);
      const dotsStart = 72 + textWidth + 10;
      const pageNumX = doc.page.width - 100;
      
      let dotsX = dotsStart;
      while (dotsX < pageNumX - 20) {
        doc.text('.', dotsX, y, { continued: true });
        dotsX += 4;
      }

      // Page number (placeholder)
      doc.text('', pageNumX, y);

      y += 25;
    });
  }

  /**
   * Add dedication page
   */
  addDedicationPage(doc, dedication) {
    doc.addPage();

    doc.font('BodyItalic')
       .fontSize(14)
       .fillColor('#555555')
       .text(dedication, 100, doc.page.height / 2 - 50, {
         align: 'center',
         width: doc.page.width - 200
       });
  }

  /**
   * Add a chapter
   */
  addChapter(doc, chapter, isFirst) {
    if (!isFirst) {
      doc.addPage();
    }

    // Chapter title
    doc.font('Heading')
       .fontSize(20)
       .fillColor('#1a1a1a')
       .text(`Chapter ${chapter.number}`, 72, 72, { align: 'center' });

    doc.moveDown(0.5)
       .font('Title')
       .fontSize(18)
       .text(chapter.title, { align: 'center' });

    doc.moveTo(100, doc.y + 10)
       .lineTo(doc.page.width - 100, doc.y + 10)
       .stroke('#c9a227')
       .lineWidth(0.5);

    doc.moveDown(2);

    // Chapter content
    doc.font('Body')
       .fontSize(11)
       .fillColor('#333333')
       .lineGap(4);

    const paragraphs = chapter.content.split('\n\n');
    
    paragraphs.forEach((paragraph, idx) => {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }

      // First paragraph of chapter gets drop cap treatment (premium)
      if (idx === 0) {
        doc.text(paragraph, {
          width: doc.page.width - 144,
          align: 'justify',
          indent: 20
        });
      } else {
        doc.text(paragraph, {
          width: doc.page.width - 144,
          align: 'justify',
          indent: 20
        });
      }

      doc.moveDown(1);
    });
  }

  /**
   * Add illustration page
   */
  async addIllustrationPage(doc, illustration) {
    try {
      const imageBuffer = await this.downloadImage(illustration.url);
      
      doc.addPage();
      
      const imgWidth = doc.page.width - 144;
      const imgHeight = (imgWidth * 1.5); // Assume portrait ratio
      
      doc.image(imageBuffer, 72, doc.page.height / 2 - imgHeight / 2, {
        fit: [imgWidth, imgHeight],
        align: 'center'
      });

      if (illustration.description) {
        doc.moveDown(2)
           .font('BodyItalic')
           .fontSize(10)
           .fillColor('#666666')
           .text(illustration.description, { align: 'center' });
      }
    } catch (error) {
      console.error('Failed to add illustration:', error);
    }
  }

  /**
   * Add about the author page
   */
  async addAboutAuthorPage(doc, aboutAuthor, authorImage) {
    doc.addPage();

    doc.font('Heading')
       .fontSize(24)
       .fillColor('#1a1a1a')
       .text('About the Author', 72, 72, { align: 'center' });

    doc.moveTo(100, 110)
       .lineTo(doc.page.width - 100, 110)
       .stroke('#c9a227')
       .lineWidth(1);

    // Author image
    if (authorImage) {
      try {
        const imageBuffer = await this.downloadImage(authorImage);
        const imgSize = 150;
        doc.image(imageBuffer, doc.page.width / 2 - imgSize / 2, 140, {
          fit: [imgSize, imgSize],
          align: 'center'
        });
        doc.moveDown(10);
      } catch (error) {
        console.error('Failed to add author image:', error);
      }
    }

    doc.moveDown(2);

    doc.font('Body')
       .fontSize(11)
       .fillColor('#333333')
       .text(aboutAuthor.text, 100, doc.y, {
         width: doc.page.width - 200,
         align: 'justify'
       });
  }

  /**
   * Add back cover page
   */
  addBackCoverPage(doc, story) {
    doc.addPage();

    // Decorative border
    doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
       .stroke('#c9a227')
       .lineWidth(2);

    doc.font('Heading')
       .fontSize(20)
       .fillColor('#1a1a1a')
       .text('Praise for', 72, 100, { align: 'center' });

    doc.font('Title')
       .fontSize(24)
       .text(story.titlePage.title, { align: 'center' });

    doc.moveDown(3);

    // Back cover blurb
    doc.font('Body')
       .fontSize(12)
       .fillColor('#444444')
       .text(story.backCover, 100, doc.y, {
         width: doc.page.width - 200,
         align: 'justify'
       });

    // QR code placeholder or website
    doc.moveDown(4);
    doc.font('BodyItalic')
       .fontSize(10)
       .fillColor('#888888')
       .text('Generated with fantm.ink', { align: 'center' });
  }

  /**
   * Download image from URL
   */
  async downloadImage(url) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    return Buffer.from(response.data, 'binary');
  }

  /**
   * Generate EPUB (for future implementation)
   */
  async generateEPUB(story, options = {}) {
    // TODO: Implement EPUB generation
    throw new Error('EPUB generation coming soon');
  }

  /**
   * Generate MOBI (for future implementation)
   */
  async generateMOBI(story, options = {}) {
    // TODO: Implement MOBI generation
    throw new Error('MOBI generation coming soon');
  }
}

module.exports = new PDFService();
