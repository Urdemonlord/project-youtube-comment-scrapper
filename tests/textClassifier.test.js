import assert from 'assert';
import { classifyComment } from '../src/utils/textClassifier.js';

const cases = [
  {
    comment: 'Programnya bagus, tapi datanya kurang jelas.',
    expected: 'Kritik Konstruktif'
  },
  {
    comment: 'Dasar bodoh!',
    expected: 'Penghinaan'
  },
  {
    comment: 'Kalian kafir semua',
    expected: 'Ujaran Kebencian'
  },
  {
    comment: 'Mantap pak, lanjutkan!',
    expected: 'Netral/Positif'
  },
  {
    comment: 'Subscribe channel saya di http://example.com',
    expected: 'Spam/Tidak Relevan'
  },
  {
    comment: 'Kamu bego banget',
    expected: 'Penghinaan'
  },
  {
    comment: 'Dasar monyet kalian',
    expected: 'Ujaran Kebencian'
  }
];

for (const { comment, expected } of cases) {
  const result = classifyComment(comment);
  assert.strictEqual(
    result.klasifikasi,
    expected,
    `Expected "${expected}" for comment "${comment}", got "${result.klasifikasi}"`
  );
}

console.log('textClassifier tests passed');
