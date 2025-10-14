/**
 * BM25 ranking service for exact term matching
 * Uses wink-bm25-text-search for efficient keyword-based retrieval
 */

import bm25 from 'wink-bm25-text-search';

// Singleton BM25 instance
let bm25Instance = null;
let isIndexed = false;

/**
 * Initialize BM25 index with FAQ data
 * @param {Array} faqs - Array of FAQ objects
 */
export function initializeBM25(faqs) {
  console.log(`Initializing BM25 index with ${faqs.length} FAQs...`);

  bm25Instance = bm25();

  // Define configuration
  bm25Instance.defineConfig({
    fldWeights: {
      question: 4,    // Question has highest weight
      answer: 2,      // Answer has medium weight
      skills: 3       // Skills have high weight
    },
    bm25Params: {
      k1: 1.2,        // Term frequency saturation (1.2-2.0 is typical)
      b: 0.75,        // Length normalization (0-1, 0.75 is typical)
      k: 1            // Query term frequency saturation
    }
  });

  // Define text preparation pipeline
  bm25Instance.definePrepTasks([
    // Lowercase
    (text) => text.toLowerCase(),
    // Remove punctuation except hyphen/underscore
    (text) => text.replace(/[^\w\s-]/g, ' '),
    // Tokenize on whitespace
    (text) => text.split(/\s+/),
    // Remove empty tokens
    (tokens) => tokens.filter(t => t.length > 0),
    // Remove stop words (optional - can improve precision)
    (tokens) => tokens.filter(t => !isStopWord(t)),
    // Stem words (optional - improves recall)
    (tokens) => tokens.map(stemWord)
  ]);

  // Add documents to index
  faqs.forEach((faq, index) => {
    bm25Instance.addDoc({
      question: faq.question,
      answer: faq.answer,
      skills: faq.skills ? faq.skills.join(' ') : '',
      // Store original index for lookup
      faqIndex: index
    }, index);
  });

  // Consolidate index for search (only if we have documents)
  if (faqs.length > 0) {
    bm25Instance.consolidate();
  }
  isIndexed = true;

  console.log('BM25 index built successfully');
}

/**
 * Search FAQs using BM25 algorithm
 * @param {string} query - User query
 * @param {number} topK - Number of results to return
 * @returns {Array} - Array of {faqIndex, score} objects
 */
export function searchBM25(query, topK = 10) {
  if (!bm25Instance || !isIndexed) {
    throw new Error('BM25 index not initialized. Call initializeBM25() first.');
  }

  // Search and get results
  const results = bm25Instance.search(query, topK);

  // Transform results to include FAQ index and score
  // Note: wink-bm25 returns document IDs, which we set as the FAQ index
  return results.map(result => ({
    faqIndex: parseInt(result[0], 10),  // Document index (convert from string)
    score: result[1]                     // BM25 score
  }));
}

/**
 * Reset BM25 index (useful for testing or reindexing)
 */
export function resetBM25() {
  bm25Instance = null;
  isIndexed = false;
  console.log('BM25 index reset');
}

/**
 * Get BM25 status
 * @returns {Object} - Status information
 */
export function getBM25Status() {
  return {
    initialized: bm25Instance !== null,
    indexed: isIndexed
  };
}

/**
 * Simple stop words list (common English words with little semantic value)
 * @param {string} word - Word to check
 * @returns {boolean} - True if word is a stop word
 */
function isStopWord(word) {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'you', 'your', 'this', 'these', 'those'
  ]);
  return stopWords.has(word);
}

/**
 * Simple Porter Stemmer implementation
 * Reduces words to their root form (e.g., "running" -> "run")
 * @param {string} word - Word to stem
 * @returns {string} - Stemmed word
 */
function stemWord(word) {
  // Simple suffix stripping (basic stemming)
  // For production, consider using a proper stemming library
  if (word.length < 4) return word;

  // Common suffixes
  const suffixes = [
    { pattern: /ing$/, replacement: '' },
    { pattern: /ed$/, replacement: '' },
    { pattern: /tion$/, replacement: 't' },
    { pattern: /ness$/, replacement: '' },
    { pattern: /ment$/, replacement: '' },
    { pattern: /able$/, replacement: '' },
    { pattern: /ible$/, replacement: '' },
    { pattern: /ly$/, replacement: '' },
    { pattern: /s$/, replacement: '' }
  ];

  for (const { pattern, replacement } of suffixes) {
    if (pattern.test(word)) {
      const stemmed = word.replace(pattern, replacement);
      // Ensure minimum word length after stemming
      if (stemmed.length >= 3) {
        return stemmed;
      }
    }
  }

  return word;
}
