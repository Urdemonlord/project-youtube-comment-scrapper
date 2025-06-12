import assert from 'assert';
import { analyzeWithIndoBert } from '../indoBertAnalyzer.js';

(async () => {
  const texts = ['Saya suka sekali videonya', 'Kamu bodoh'];
  const result = await analyzeWithIndoBert(texts);

  assert.strictEqual(Array.isArray(result.comments), true, 'comments should be array');
  assert.strictEqual(result.comments.length, texts.length, 'result length mismatch');
  for (const comment of result.comments) {
    assert.strictEqual(typeof comment.sentiment, 'number');
    assert.ok(comment.toxicity && typeof comment.toxicity.overall === 'number');
  }
  console.log('indoBertAnalyzer tests passed');
})();
