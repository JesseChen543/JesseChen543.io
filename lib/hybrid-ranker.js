/**
 * Hybrid ranking system combining BM25 (exact term matching) and
 * semantic embeddings (meaning-based matching)
 *
 * Strategy: Use BM25 for keyword precision + embeddings for semantic recall
 */

import { searchBM25, initializeBM25, getBM25Status } from './bm25-service.js';
import { generateEmbedding, cosineSimilarity, precomputeFAQEmbeddings } from './embedding-service.js';

// Store FAQ data for hybrid ranking
let faqData = null;

/**
 * Initialize the hybrid ranking system
 * @param {Array} faqs - Array of FAQ objects
 */
export async function initializeHybridRanker(faqs) {
  console.log('Initializing hybrid ranking system...');

  // Store FAQ data
  faqData = faqs;

  // Initialize BM25 index
  initializeBM25(faqs);

  // Precompute embeddings for all FAQs
  await precomputeFAQEmbeddings(faqs);

  console.log('Hybrid ranking system initialized successfully');
}

/**
 * Rank FAQs using hybrid approach (BM25 + semantic embeddings)
 * @param {string} query - User query
 * @param {Object} options - Ranking options
 * @param {number} options.topK - Number of results to return (default: 5)
 * @param {number} options.bm25Weight - Weight for BM25 score (default: 0.4)
 * @param {number} options.embeddingWeight - Weight for embedding score (default: 0.6)
 * @returns {Promise<Array>} - Array of top-ranked FAQ objects
 */
export async function rankFAQs(query, options = {}) {
  const {
    topK = 5,
    bm25Weight = 0.4,
    embeddingWeight = 0.6
  } = options;

  if (!faqData) {
    throw new Error('Hybrid ranker not initialized. Call initializeHybridRanker() first.');
  }

  console.log(`Ranking FAQs for query: "${query}"`);
  console.time('Hybrid ranking');

  // Step 1: BM25 search (fast keyword matching)
  console.time('BM25 search');
  const bm25Results = searchBM25(query, 15); // Get top 15 candidates
  console.timeEnd('BM25 search');

  // Normalize BM25 scores to 0-1 range
  const maxBM25Score = Math.max(...bm25Results.map(r => r.score), 1);
  const normalizedBM25 = bm25Results.map(r => ({
    faqIndex: r.faqIndex,
    bm25Score: r.score / maxBM25Score
  }));

  // Step 2: Generate query embedding
  console.time('Query embedding');
  const queryEmbedding = await generateEmbedding(query);
  console.timeEnd('Query embedding');

  // Step 3: Calculate semantic similarity for BM25 candidates
  console.time('Semantic scoring');
  const hybridScores = await Promise.all(
    normalizedBM25.map(async (result) => {
      const faq = faqData[result.faqIndex];

      // Generate FAQ embedding
      const faqText = `${faq.question} ${faq.answer} ${faq.skills ? faq.skills.join(' ') : ''}`;
      const faqEmbedding = await generateEmbedding(faqText);

      // Calculate cosine similarity
      const semanticScore = cosineSimilarity(queryEmbedding, faqEmbedding);

      // Hybrid score = weighted combination
      const hybridScore = (bm25Weight * result.bm25Score) + (embeddingWeight * semanticScore);

      return {
        faq,
        faqIndex: result.faqIndex,
        bm25Score: result.bm25Score,
        semanticScore,
        hybridScore
      };
    })
  );
  console.timeEnd('Semantic scoring');

  // Step 4: Sort by hybrid score and return top K
  const rankedResults = hybridScores
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, topK);

  console.timeEnd('Hybrid ranking');

  // Log ranking details
  console.log('Top ranked FAQs:');
  rankedResults.forEach((result, index) => {
    console.log(`${index + 1}. [Score: ${result.hybridScore.toFixed(3)}] ` +
                `(BM25: ${result.bm25Score.toFixed(3)}, Semantic: ${result.semanticScore.toFixed(3)}) ` +
                `- ${result.faq.question.substring(0, 60)}...`);
  });

  return rankedResults.map(r => r.faq);
}

/**
 * Get ranker status
 * @returns {Object} - Status information
 */
export function getHybridRankerStatus() {
  return {
    faqDataLoaded: faqData !== null,
    faqCount: faqData ? faqData.length : 0,
    bm25Status: getBM25Status()
  };
}

/**
 * Reset hybrid ranker (useful for testing)
 */
export function resetHybridRanker() {
  faqData = null;
  console.log('Hybrid ranker reset');
}
