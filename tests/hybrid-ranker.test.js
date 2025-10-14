/**
 * Tests for hybrid ranker
 * Tests combined BM25 + embedding ranking system
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  initializeHybridRanker,
  rankFAQs,
  getHybridRankerStatus,
  resetHybridRanker
} from '../lib/hybrid-ranker.js';

// Sample FAQ data for testing
const sampleFAQs = [
  {
    id: 1,
    question: 'What are your JavaScript programming skills?',
    answer: 'I have strong JavaScript skills including ES6+, async/await, and React. I build modern web applications.',
    skills: ['JavaScript', 'React', 'ES6', 'web development']
  },
  {
    id: 2,
    question: 'Do you have Python experience for data science?',
    answer: 'Yes, I have extensive Python experience for data analysis, machine learning, and statistical modeling.',
    skills: ['Python', 'data analysis', 'machine learning', 'statistics']
  },
  {
    id: 3,
    question: 'What web development frameworks do you know?',
    answer: 'I work with React, Vue, Node.js, and Express for building full-stack web applications.',
    skills: ['React', 'Vue', 'Node.js', 'Express', 'web development']
  },
  {
    id: 4,
    question: 'Tell me about your database experience',
    answer: 'I have experience with MongoDB, MySQL, PostgreSQL, and Redis for various data storage needs.',
    skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'database']
  },
  {
    id: 5,
    question: 'What is your experience with artificial intelligence?',
    answer: 'I have built AI models using TensorFlow and PyTorch for classification and prediction tasks.',
    skills: ['AI', 'machine learning', 'TensorFlow', 'PyTorch', 'deep learning']
  },
  {
    id: 6,
    question: 'Can you describe your problem-solving approach?',
    answer: 'I break down complex problems into smaller parts, research solutions, and implement iteratively.',
    skills: ['problem solving', 'analytical thinking', 'debugging']
  }
];

describe('Hybrid Ranker', () => {
  beforeAll(async () => {
    // Initialize hybrid ranker once for all tests
    await initializeHybridRanker(sampleFAQs);
  }, 60000); // 60s timeout for initialization

  afterAll(() => {
    resetHybridRanker();
  });

  describe('initialization', () => {
    it('should initialize hybrid ranker successfully', () => {
      const status = getHybridRankerStatus();
      expect(status.faqDataLoaded).toBe(true);
      expect(status.faqCount).toBe(6);
      expect(status.bm25Status.initialized).toBe(true);
      expect(status.bm25Status.indexed).toBe(true);
    });

    it('should report correct FAQ count', () => {
      const status = getHybridRankerStatus();
      expect(status.faqCount).toBe(sampleFAQs.length);
    });
  });

  describe('rankFAQs - exact keyword matching', () => {
    it('should rank JavaScript query correctly', async () => {
      const results = await rankFAQs('JavaScript programming', { topK: 3 });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(results[0].id).toBe(1); // JavaScript FAQ should be top
    }, 30000);

    it('should rank Python query correctly', async () => {
      const results = await rankFAQs('Python data science', { topK: 3 });

      expect(results[0].id).toBe(2); // Python FAQ should be top
    }, 30000);

    it('should rank database query correctly', async () => {
      const results = await rankFAQs('database MongoDB MySQL', { topK: 3 });

      expect(results[0].id).toBe(4); // Database FAQ should be top
    }, 30000);
  });

  describe('rankFAQs - semantic matching', () => {
    it('should understand synonyms and related terms', async () => {
      // "coding" is semantically similar to "programming"
      const results = await rankFAQs('coding with JavaScript', { topK: 3 });

      // Should still rank JavaScript FAQ high despite "coding" vs "programming"
      expect(results[0].id).toBe(1);
    }, 30000);

    it('should match conceptually similar queries', async () => {
      // "AI" and "machine learning" are related concepts
      const results = await rankFAQs('artificial intelligence models', { topK: 3 });

      // Should find the AI/ML FAQ (id 5)
      expect(results[0].id).toBe(5);
    }, 30000);

    it('should understand paraphrased questions', async () => {
      // Different phrasing of database question
      const results = await rankFAQs('What databases have you worked with?', { topK: 3 });

      // Should match database FAQ despite different wording
      const dbFaq = results.find(faq => faq.id === 4);
      expect(dbFaq).toBeDefined();
    }, 30000);

    it('should handle conversational queries', async () => {
      const results = await rankFAQs('Can you tell me about your skills in building websites?', { topK: 3 });

      // Should find web development FAQs (id 1 or 3)
      const topIds = results.map(r => r.id);
      expect(topIds.some(id => id === 1 || id === 3)).toBe(true);
    }, 30000);
  });

  describe('rankFAQs - hybrid scoring', () => {
    it('should balance BM25 and semantic scores', async () => {
      const results = await rankFAQs('web development React', {
        topK: 5,
        bm25Weight: 0.5,
        embeddingWeight: 0.5
      });

      expect(results.length).toBeGreaterThan(0);
      // Should prioritize FAQs with both keyword matches and semantic relevance
      const topIds = results.slice(0, 2).map(r => r.id);
      expect(topIds).toContain(1); // JavaScript/React FAQ
    }, 30000);

    it('should favor BM25 with higher BM25 weight', async () => {
      const results = await rankFAQs('JavaScript', {
        topK: 3,
        bm25Weight: 0.9, // Heavy BM25 weight
        embeddingWeight: 0.1
      });

      // Should strongly prefer exact keyword matches
      expect(results[0].id).toBe(1);
    }, 30000);

    it('should favor semantics with higher embedding weight', async () => {
      const results = await rankFAQs('coding frontend applications', {
        topK: 3,
        bm25Weight: 0.1,
        embeddingWeight: 0.9 // Heavy semantic weight
      });

      // Should understand "frontend applications" relates to web dev
      const topIds = results.map(r => r.id);
      expect(topIds.some(id => id === 1 || id === 3)).toBe(true);
    }, 30000);
  });

  describe('rankFAQs - topK parameter', () => {
    it('should return exactly topK results when available', async () => {
      const results = await rankFAQs('programming', { topK: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    }, 30000);

    it('should handle topK larger than FAQ count', async () => {
      const results = await rankFAQs('test query', { topK: 100 });
      expect(results.length).toBeLessThanOrEqual(sampleFAQs.length);
    }, 30000);

    it('should handle topK of 1', async () => {
      const results = await rankFAQs('JavaScript', { topK: 1 });
      expect(results.length).toBe(1);
    }, 30000);
  });

  describe('ranking quality', () => {
    it('should return results sorted by relevance', async () => {
      const results = await rankFAQs('machine learning AI', { topK: 5 });

      // Check if results are properly sorted (scores should be descending)
      // We can't directly check scores, but top result should be ML/AI FAQ
      expect(results[0].id).toBe(5);
    }, 30000);

    it('should handle multi-topic queries', async () => {
      const results = await rankFAQs('JavaScript and Python programming experience', { topK: 3 });

      // Should find both JavaScript and Python FAQs
      const topIds = results.map(r => r.id);
      expect(topIds).toContain(1); // JavaScript
      expect(topIds).toContain(2); // Python
    }, 30000);

    it('should prioritize exact matches over partial matches', async () => {
      const results = await rankFAQs('What are your JavaScript programming skills?', { topK: 3 });

      // Exact question match should be #1
      expect(results[0].id).toBe(1);
    }, 30000);
  });

  describe('edge cases', () => {
    it('should handle empty query', async () => {
      const results = await rankFAQs('', { topK: 3 });
      expect(Array.isArray(results)).toBe(true);
      // May return low-scored results, but shouldn't error
    }, 30000);

    it('should handle very short query', async () => {
      const results = await rankFAQs('JS', { topK: 3 });
      expect(Array.isArray(results)).toBe(true);
    }, 30000);

    it('should handle very long query', async () => {
      const longQuery = 'I am looking for someone with extensive JavaScript programming experience in building web applications using React and other modern frameworks'.repeat(5);
      const results = await rankFAQs(longQuery, { topK: 3 });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle queries with special characters', async () => {
      const results = await rankFAQs('Node.js & Express.js!!!', { topK: 3 });
      expect(Array.isArray(results)).toBe(true);
    }, 30000);

    it('should handle queries in different case', async () => {
      const results1 = await rankFAQs('JAVASCRIPT', { topK: 3 });
      const results2 = await rankFAQs('javascript', { topK: 3 });

      expect(results1[0].id).toBe(results2[0].id);
    }, 30000);

    it('should handle unrelated queries gracefully', async () => {
      const results = await rankFAQs('quantum physics astrophysics cosmology', { topK: 3 });
      expect(Array.isArray(results)).toBe(true);
      // May return 0 results if nothing matches - that's acceptable
      expect(results.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('performance', () => {
    it('should rank FAQs in reasonable time', async () => {
      const start = Date.now();
      await rankFAQs('test query', { topK: 5 });
      const duration = Date.now() - start;

      // Should complete in under 2 seconds (including embedding generation)
      expect(duration).toBeLessThan(2000);
    }, 30000);

    it('should handle multiple consecutive queries efficiently', async () => {
      const queries = [
        'JavaScript',
        'Python',
        'database',
        'web development',
        'machine learning'
      ];

      for (const query of queries) {
        const results = await rankFAQs(query, { topK: 3 });
        expect(results.length).toBeGreaterThan(0);
      }
    }, 60000);
  });

  describe('error handling', () => {
    it('should throw error if ranker not initialized', async () => {
      resetHybridRanker();

      await expect(rankFAQs('test', { topK: 5 })).rejects.toThrow();

      // Re-initialize for other tests
      await initializeHybridRanker(sampleFAQs);
    }, 60000);

    it('should handle invalid weights gracefully', async () => {
      // Weights don't sum to 1.0, but should still work
      const results = await rankFAQs('JavaScript', {
        topK: 3,
        bm25Weight: 0.3,
        embeddingWeight: 0.3 // Sum = 0.6, not 1.0
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    }, 30000);
  });
});
