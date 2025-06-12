import assert from 'assert';
import { fetchComments } from '../youtubeFetcher.js';

(async () => {
  let calledOptions;
  const fakeClient = {
    commentThreads: {
      list: async (opts) => {
        calledOptions = opts;
        return { data: { items: [], nextPageToken: null } };
      }
    }
  };

  await fetchComments('abc', 10, 'time', fakeClient);
  assert.strictEqual(calledOptions.order, 'time', 'order should be forwarded');

  await fetchComments('abc', 10, undefined, fakeClient);
  assert.strictEqual(calledOptions.order, 'relevance', 'default order should be relevance');

  console.log('fetchComments tests passed');
})();
