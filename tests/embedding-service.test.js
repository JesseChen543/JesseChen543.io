/**
 * Tests for embedding service
 * Tests local embedding generation and similarity calculations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  generateEmbedding,
  cosineSimilarity,
  batchGenerateEmbeddings,
  clearEmbeddingCache,
  getCacheStats
} from '../lib/embedding-service.js';

describe('Embedding Service', () => {
  // Clean up after all tests
  afterAll(() => {
    clearEmbeddingCache();
  });

  describe('generateEmbedding', () => {
    it('should generate embeddings for text', async () => {
      const text = 'JavaScript programming skills';
      const embedding = await generateEmbedding(text);

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(384); // all-MiniLM-L6-v2 produces 384-dim vectors
      expect(embedding.every(val => typeof val === 'number')).toBe(true);
    }, 30000); // 30s timeout for model download

    it('should cache embeddings for same text', async () => {
      const text = 'Python data analysis';

      // First call
      const embedding1 = await generateEmbedding(text);
      const stats1 = getCacheStats();

      // Second call (should be cached)
      const embedding2 = await generateEmbedding(text);
      const stats2 = getCacheStats();

      expect(embedding1).toEqual(embedding2);
      expect(stats2.size).toBeGreaterThanOrEqual(stats1.size);
    });

    it('should generate different embeddings for different text', async () => {
      const text1 = 'web development';
      const text2 = 'machine learning';

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);

      expect(embedding1).not.toEqual(embedding2);
    });

    it('should handle empty string', async () => {
      const text = '';
      const embedding = await generateEmbedding(text);

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(384);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate similarity between identical vectors', () => {
      const vec = [1, 2, 3, 4, 5];
      const similarity = cosineSimilarity(vec, vec);

      expect(similarity).toBeCloseTo(1.0, 5); // Should be exactly 1.0
    });

    it('should calculate similarity between orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(0.0, 5); // Should be exactly 0.0
    });

    it('should calculate similarity between similar vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2, 4];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeGreaterThan(0.9); // Should be high
      expect(similarity).toBeLessThan(1.0);
    });

    it('should calculate similarity between opposite vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(-1.0, 5); // Should be exactly -1.0
    });

    it('should throw error for vectors of different lengths', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2];

      expect(() => cosineSimilarity(vec1, vec2)).toThrow();
    });

    it('should handle zero vectors', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [1, 2, 3];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });
  });

  describe('semantic similarity tests', () => {
    it('should show high similarity for semantically similar text', async () => {
      const text1 = 'web development with JavaScript';
      const text2 = 'JavaScript programming for websites';

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);
      const similarity = cosineSimilarity(embedding1, embedding2);

      expect(similarity).toBeGreaterThan(0.7); // High semantic similarity
    }, 30000);

    it('should show low similarity for semantically different text', async () => {
      const text1 = 'machine learning with Python';
      const text2 = 'cooking pasta recipes';

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);
      const similarity = cosineSimilarity(embedding1, embedding2);

      expect(similarity).toBeLessThan(0.3); // Low semantic similarity
    }, 30000);

    it('should detect synonyms and related concepts', async () => {
      const text1 = 'automobile';
      const text2 = 'car';

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);
      const similarity = cosineSimilarity(embedding1, embedding2);

      expect(similarity).toBeGreaterThan(0.6); // Related concepts
    }, 30000);
  });

  describe('batchGenerateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = [
        'JavaScript programming',
        'Python data science',
        'React web development'
      ];

      const embeddings = await batchGenerateEmbeddings(texts);

      expect(embeddings).toHaveLength(3);
      expect(embeddings.every(emb => emb.length === 384)).toBe(true);
    }, 60000); // Longer timeout for batch processing
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      await generateEmbedding('test text');
      const statsBefore = getCacheStats();
      expect(statsBefore.size).toBeGreaterThan(0);

      clearEmbeddingCache();
      const statsAfter = getCacheStats();
      expect(statsAfter.size).toBe(0);
    });

    it('should report cache stats', async () => {
      clearEmbeddingCache();
      const stats1 = getCacheStats();
      expect(stats1.size).toBe(0);

      await generateEmbedding('test1');
      await generateEmbedding('test2');

      const stats2 = getCacheStats();
      expect(stats2.size).toBeGreaterThan(0);
      expect(stats2.modelLoaded).toBe(true);
    });
  });
});
