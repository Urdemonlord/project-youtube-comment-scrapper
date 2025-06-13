import assert from 'assert';
import fs from 'fs';

(async () => {
  delete process.env.HUGGINGFACE_API_TOKEN;
  const exists = fs.existsSync;
  fs.existsSync = () => false;

  let callCount = 0;
  global.fetch = async (_url, options) => {
    callCount++;
    const body = JSON.parse(options.body);
    const text = body.inputs;
    const label = text.includes('love') ? 'POSITIVE' : 'NEGATIVE';
    return {
      ok: true,
      async json() {
        return [{ label, score: 0.9 }];
      }
    };
  };

  const mod = await import('../src/services/sentimentService.ts?' + Date.now());
  const { analyze } = mod;

  const positive = await analyze('I love this video');
  assert.deepStrictEqual(positive, { label: 'POSITIVE', score: 0.9 });
  await analyze('I love this video');
  assert.strictEqual(callCount, 1, 'result should be cached');

  const negative = await analyze('I hate this video');
  assert.deepStrictEqual(negative, { label: 'NEGATIVE', score: 0.9 });
  assert.strictEqual(callCount, 2, 'should call fetch for new text');

  fs.existsSync = exists;
  console.log('sentimentService tests passed');
})();
