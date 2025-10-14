/**
 * Free local embedding service using Transformers.js
 * No API costs - runs locally with cached models
 */

import { pipeline } from '@xenova/transformers';

// Singleton pattern for model instance
let extractor = null;

// In-memory cache for embeddings
const embeddingCache = new Map();

/**
 * Initialize the embedding model (lazy loading)
 * Uses 'Xenova/all-MiniLM-L6-v2' - fast, free, and good quality
 * Model size: ~23MB (downloads once, then cached)
 */
async function getExtractor() {
  if (!extractor) {
    console.log('Loading embedding model (first time only)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded successfully');
  }
  return extractor;
}

/**
 * Generate embedding for a given text (100% free, runs locally)
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (384 dimensions)
 */
export async function generateEmbedding(text) {
  // Check cache first
  const cacheKey = `embed:${text}`;
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  try {
    const model = await getExtractor();

    // Generate embedding
    const output = await model(text, { pooling: 'mean', normalize: true });

    // Convert to regular array
    const embedding = Array.from(output.data);

    // Cache the embedding
    embeddingCache.set(cacheKey, embedding);

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Batch generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function batchGenerateEmbeddings(texts) {
  const embeddings = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

/**
 * Pre-compute and cache embeddings for FAQ data
 * @param {Array} faqs - Array of FAQ objects
 * @returns {Promise<void>}
 */
export async function precomputeFAQEmbeddings(faqs) {
  console.log(`Precomputing embeddings for ${faqs.length} FAQs...`);

  for (const faq of faqs) {
    // Combine question, answer, and skills for embedding
    const text = `${faq.question} ${faq.answer} ${faq.skills ? faq.skills.join(' ') : ''}`;

    // This will cache the embedding
    await generateEmbedding(text);
  }

  console.log('FAQ embeddings precomputed and cached');
}

/**
 * Clear the embedding cache (useful for testing)
 */
export function clearEmbeddingCache() {
  embeddingCache.clear();
  console.log('Embedding cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} - Cache size
 */
export function getCacheStats() {
  return {
    size: embeddingCache.size,
    modelLoaded: extractor !== null
  };
}
