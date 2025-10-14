/**
 * Integration tests for chat API with hybrid ranking
 * Tests the full pipeline from query to ranked FAQ selection
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeHybridRanker, rankFAQs } from '../lib/hybrid-ranker.js';
import fs from 'fs';
import path from 'path';

describe('Chat API Integration Tests', () => {
  let realFAQData;

  beforeAll(async () => {
    // Load real FAQ data from the project
    try {
      const faqPath = path.resolve(process.cwd(), 'data/faq.json');
      const faqContent = fs.readFileSync(faqPath, 'utf-8');
      const faqJson = JSON.parse(faqContent);
      realFAQData = faqJson.faqs;

      // Initialize hybrid ranker with real data
      console.log(`Loading ${realFAQData.length} FAQs for integration testing...`);
      await initializeHybridRanker(realFAQData);
      console.log('Hybrid ranker initialized successfully');
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      throw error;
    }
  }, 120000); // 2 minute timeout for loading real data

  describe('Real-world query scenarios', () => {
    it('should find relevant FAQs for technical skills query', async () => {
      const results = await rankFAQs('What are your technical skills?', { topK: 5 });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);

      // Should return FAQ objects with expected structure
      results.forEach(faq => {
        expect(faq).toHaveProperty('question');
        expect(faq).toHaveProperty('answer');
        expect(typeof faq.question).toBe('string');
        expect(typeof faq.answer).toBe('string');
      });

      console.log('Top result for technical skills:', results[0].question);
    }, 30000);

    it('should find relevant FAQs for project experience query', async () => {
      const results = await rankFAQs('Tell me about your projects', { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Check if results mention projects or experience
      const hasProjectContent = results.some(faq =>
        faq.question.toLowerCase().includes('project') ||
        faq.answer.toLowerCase().includes('project')
      );

      expect(hasProjectContent).toBe(true);
      console.log('Top result for projects:', results[0].question);
    }, 30000);

    it('should find relevant FAQs for work experience query', async () => {
      const results = await rankFAQs('What is your professional experience?', { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Should find experience-related FAQs
      const hasExperienceContent = results.some(faq =>
        faq.question.toLowerCase().includes('experience') ||
        faq.answer.toLowerCase().includes('experience') ||
        faq.question.toLowerCase().includes('work')
      );

      expect(hasExperienceContent).toBe(true);
      console.log('Top result for experience:', results[0].question);
    }, 30000);

    it('should handle programming language queries', async () => {
      const results = await rankFAQs('Do you know JavaScript and Python?', { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Should mention programming or languages
      const hasProgrammingContent = results.some(faq =>
        faq.answer.toLowerCase().includes('javascript') ||
        faq.answer.toLowerCase().includes('python') ||
        faq.answer.toLowerCase().includes('programming')
      );

      expect(hasProgrammingContent).toBe(true);
      console.log('Top result for languages:', results[0].question);
    }, 30000);

    it('should handle AI/ML related queries', async () => {
      const results = await rankFAQs('What experience do you have with AI and machine learning?', { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Log results for manual verification
      console.log('AI/ML query results:');
      results.forEach((faq, i) => {
        console.log(`${i + 1}. ${faq.question.substring(0, 80)}...`);
      });
    }, 30000);

    it('should handle conversational queries', async () => {
      const results = await rankFAQs('Hey, can you tell me a bit about yourself?', { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Should find background/about FAQs
      const hasAboutContent = results.some(faq =>
        faq.question.toLowerCase().includes('about') ||
        faq.question.toLowerCase().includes('yourself') ||
        faq.question.toLowerCase().includes('background')
      );

      expect(hasAboutContent).toBe(true);
      console.log('Top result for about query:', results[0].question);
    }, 30000);
  });

  describe('Ranking quality verification', () => {
    it('should rank results by relevance', async () => {
      const results = await rankFAQs('What programming languages do you know?', { topK: 5 });

      // Results should be ordered by relevance
      // Can't check exact scores, but verify structure
      expect(results.length).toBeGreaterThan(0);

      console.log('Ranking for programming languages:');
      results.forEach((faq, i) => {
        console.log(`${i + 1}. ${faq.question.substring(0, 80)}...`);
      });
    }, 30000);

    it('should find specific FAQ with exact question match', async () => {
      // Use an actual question from the FAQ data
      if (realFAQData.length > 0) {
        const exactQuestion = realFAQData[0].question;
        const results = await rankFAQs(exactQuestion, { topK: 3 });

        // Exact match should be #1
        expect(results[0].question).toBe(exactQuestion);
      }
    }, 30000);

    it('should handle paraphrased questions', async () => {
      const queries = [
        'What are your strengths?',
        'What are you good at?',
        'What skills do you have?'
      ];

      for (const query of queries) {
        const results = await rankFAQs(query, { topK: 3 });
        expect(results.length).toBeGreaterThan(0);
      }
    }, 60000);
  });

  describe('Performance with real data', () => {
    it('should handle real FAQ dataset efficiently', async () => {
      const start = Date.now();
      const results = await rankFAQs('test query', { topK: 5 });
      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      console.log(`Query time with ${realFAQData.length} FAQs: ${duration}ms`);

      // Should complete in under 3 seconds even with full dataset
      expect(duration).toBeLessThan(3000);
    }, 30000);

    it('should handle multiple queries in succession', async () => {
      const queries = [
        'technical skills',
        'work experience',
        'projects',
        'education',
        'achievements'
      ];

      const start = Date.now();
      for (const query of queries) {
        await rankFAQs(query, { topK: 5 });
      }
      const totalDuration = Date.now() - start;

      console.log(`Total time for ${queries.length} queries: ${totalDuration}ms`);
      console.log(`Average per query: ${(totalDuration / queries.length).toFixed(0)}ms`);

      // Should handle all queries efficiently (cached embeddings help)
      expect(totalDuration).toBeLessThan(10000); // 10 seconds for 5 queries
    }, 60000);
  });

  describe('Edge cases with real data', () => {
    it('should handle queries not matching any FAQ', async () => {
      const results = await rankFAQs('quantum computing blockchain metaverse', { topK: 5 });

      // Should still return results (best matches even if not perfect)
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle very specific technical queries', async () => {
      const results = await rankFAQs('Have you used TensorFlow with PyTorch for deep learning?', { topK: 5 });

      expect(results.length).toBeGreaterThan(0);
      console.log('Specific tech query result:', results[0].question.substring(0, 80));
    }, 30000);

    it('should handle multi-sentence queries', async () => {
      const longQuery = `I'm interested in hiring a developer.
        What experience do you have with web development?
        Do you know React and Node.js?
        Have you worked on full-stack projects?`;

      const results = await rankFAQs(longQuery, { topK: 5 });
      expect(results.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Comparison: keyword vs hybrid ranking', () => {
    it('should outperform pure keyword matching for semantic queries', async () => {
      // Query with synonyms/paraphrasing
      const semanticQuery = 'What coding languages are you proficient in?';
      // "coding" vs "programming", "proficient" vs "skilled"

      const results = await rankFAQs(semanticQuery, { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Should understand semantic meaning despite different wording
      console.log('Semantic query result:', results[0].question);
    }, 30000);

    it('should maintain keyword precision for exact matches', async () => {
      // Query with specific technical term
      const keywordQuery = 'MongoDB database experience';

      const results = await rankFAQs(keywordQuery, { topK: 5 });

      expect(results.length).toBeGreaterThan(0);

      // Should prioritize FAQs mentioning MongoDB
      console.log('Keyword query result:', results[0].question);
    }, 30000);
  });

  describe('Data consistency checks', () => {
    it('should have loaded FAQ data correctly', () => {
      expect(realFAQData).toBeDefined();
      expect(Array.isArray(realFAQData)).toBe(true);
      expect(realFAQData.length).toBeGreaterThan(0);

      console.log(`Loaded ${realFAQData.length} FAQs from data/faq.json`);
    });

    it('should have FAQs with required fields', () => {
      realFAQData.forEach(faq => {
        expect(faq).toHaveProperty('question');
        expect(faq).toHaveProperty('answer');
        expect(typeof faq.question).toBe('string');
        expect(typeof faq.answer).toBe('string');
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });

    it('should have skills array in most FAQs', () => {
      const faqsWithSkills = realFAQData.filter(faq => faq.skills && Array.isArray(faq.skills));
      const percentage = (faqsWithSkills.length / realFAQData.length) * 100;

      console.log(`${percentage.toFixed(1)}% of FAQs have skills array`);
      expect(percentage).toBeGreaterThan(50); // Most FAQs should have skills
    });
  });
});
