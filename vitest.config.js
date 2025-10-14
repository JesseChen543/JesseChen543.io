/**
 * Vitest configuration for testing BM25 + embedding hybrid ranking
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test timeout (30s default, some tests need longer for model loading)
    testTimeout: 30000,

    // Globals
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'data/',
        'assets/',
        'css/',
        'js/terminal-chatbot.js', // Frontend code
        'js/contact.js'            // Frontend code
      ]
    },

    // Reporter
    reporter: 'verbose',

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.github'
    ],

    // Pool options for parallel execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false
      }
    }
  }
});
