# Test Suite for Hybrid Ranking System

Comprehensive test suite for the BM25 + embedding hybrid ranking system used in the chatbot.

## Test Files

### 1. `embedding-service.test.js`
Tests the free local embedding service using Transformers.js.

**Coverage:**
- ✅ Embedding generation (384-dimensional vectors)
- ✅ Cosine similarity calculations
- ✅ Semantic similarity detection
- ✅ Caching mechanism
- ✅ Batch embedding generation
- ✅ Edge cases (empty strings, long text, special characters)

**Key Tests:**
- Identical vectors should have similarity = 1.0
- Orthogonal vectors should have similarity = 0.0
- Semantically similar text should score > 0.7
- Synonyms should be detected
- Cache should improve performance

### 2. `bm25-service.test.js`
Tests the BM25 keyword-based ranking algorithm.

**Coverage:**
- ✅ Index initialization
- ✅ Search functionality
- ✅ Field weighting (question:4x, skills:3x, answer:2x)
- ✅ Text preprocessing (stemming, stop words)
- ✅ Case insensitivity
- ✅ Ranking quality
- ✅ Performance benchmarks

**Key Tests:**
- Exact keyword matches rank highest
- Stop words are filtered correctly
- Stemming works (programming → program)
- Field weights are applied correctly
- Search completes in < 100ms

### 3. `hybrid-ranker.test.js`
Tests the combined BM25 + embedding ranking system.

**Coverage:**
- ✅ Initialization with FAQ data
- ✅ Exact keyword matching (BM25)
- ✅ Semantic matching (embeddings)
- ✅ Hybrid scoring (40% BM25 + 60% embeddings)
- ✅ TopK result selection
- ✅ Customizable weights
- ✅ Multi-topic queries
- ✅ Paraphrased questions

**Key Tests:**
- JavaScript query ranks JavaScript FAQ highest
- Semantic queries understand synonyms ("coding" ≈ "programming")
- Hybrid scores balance keyword precision + semantic recall
- Results are sorted by relevance
- Performance < 2s per query

### 4. `chat-integration.test.js`
Integration tests with real FAQ data from `data/faq.json`.

**Coverage:**
- ✅ Real-world query scenarios
- ✅ Technical skills queries
- ✅ Project experience queries
- ✅ Work experience queries
- ✅ AI/ML queries
- ✅ Conversational queries
- ✅ Performance with full dataset
- ✅ Comparison vs pure keyword matching

**Key Tests:**
- Loads real FAQ data (26+ FAQs)
- Handles conversational queries
- Maintains performance < 3s with full dataset
- Multiple queries with caching < 10s
- Data consistency checks

---

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

### Run tests with UI (visual test runner):
```bash
npm run test:ui
```

### Run specific test suites:
```bash
npm run test:embedding    # Embedding service only
npm run test:bm25         # BM25 service only
npm run test:hybrid       # Hybrid ranker only
npm run test:integration  # Integration tests only
```

### Run with coverage:
```bash
npm run test:coverage
```

---

## Test Statistics

### Expected Test Counts:
- **Embedding Service**: ~15 tests
- **BM25 Service**: ~25 tests
- **Hybrid Ranker**: ~30 tests
- **Integration**: ~20 tests
- **Total**: ~90 tests

### Performance Benchmarks:
- Embedding generation: < 1s (first time), < 10ms (cached)
- BM25 search: < 100ms
- Hybrid ranking: < 2s per query
- Integration tests: < 3s per query

---

## Test Output Examples

### Successful Test Run:
```
✓ tests/embedding-service.test.js (15)
  ✓ Embedding Service (15)
    ✓ should generate 384-dim embeddings
    ✓ should cache embeddings
    ✓ should calculate cosine similarity
    ...

✓ tests/bm25-service.test.js (25)
  ✓ BM25 Service (25)
    ✓ should initialize index
    ✓ should rank JavaScript FAQ highest
    ...

✓ tests/hybrid-ranker.test.js (30)
  ✓ Hybrid Ranker (30)
    ✓ should combine BM25 + embeddings
    ✓ should understand semantic queries
    ...

✓ tests/chat-integration.test.js (20)
  ✓ Chat Integration (20)
    ✓ should find technical skills FAQ
    ✓ should handle conversational queries
    ...

Test Files  4 passed (4)
Tests  90 passed (90)
Duration  45.23s
```

---

## Troubleshooting

### Model Download Issues
**Problem**: First test run downloads 23MB model, may timeout.

**Solution**: Increase timeout or run embedding tests separately first:
```bash
npm run test:embedding
```

### Memory Issues
**Problem**: Tests consume ~50MB RAM for embeddings.

**Solution**: Run test files sequentially instead of parallel:
```bash
vitest run --pool forks --poolOptions.forks.singleFork
```

### Slow Tests
**Problem**: Integration tests with real data take 2-3s per query.

**Solution**: This is expected for first query (model initialization). Subsequent queries use cache and run faster.

---

## CI/CD Integration

Tests can be integrated into GitHub Actions workflow:

```yaml
- name: Run Tests
  run: npm test
  timeout-minutes: 5

- name: Generate Coverage
  run: npm run test:coverage
```

**Note**: First run in CI will download the embedding model (~23MB). Consider caching the model directory for faster subsequent runs.

---

## Writing New Tests

### Test Template:
```javascript
import { describe, it, expect } from 'vitest';
import { rankFAQs } from '../lib/hybrid-ranker.js';

describe('New Feature', () => {
  it('should do something', async () => {
    const result = await rankFAQs('test query', { topK: 5 });
    expect(result).toBeDefined();
  }, 30000); // 30s timeout
});
```

### Best Practices:
1. Use descriptive test names
2. Set appropriate timeouts for async tests
3. Clean up resources in `afterEach` / `afterAll`
4. Test both success and error cases
5. Include performance benchmarks
6. Log meaningful debug info for failing tests

---

## Dependencies

- **Vitest**: Fast unit test framework
- **@vitest/ui**: Visual test runner
- **@xenova/transformers**: Local embeddings (no API costs)
- **wink-bm25-text-search**: BM25 algorithm implementation

All test dependencies are in `devDependencies` and not deployed to production.
