import assert from 'assert';

async function fetchComments(videoId, maxComments = 100, includeReplies = false) {
  const youtube = {
    commentThreads: {
      async list() {
        return {
          data: {
            items: [
              {
                id: 'c1',
                snippet: {
                  topLevelComment: { snippet: { textDisplay: 'top', authorDisplayName: 'A', publishedAt: '2021', likeCount: 1 } },
                  totalReplyCount: 1
                },
                replies: {
                  comments: [
                    { id: 'r1', snippet: { textDisplay: 'reply', authorDisplayName: 'B', publishedAt: '2021', likeCount: 0 } }
                  ]
                }
              }
            ],
            nextPageToken: undefined
          }
        };
      }
    }
  };

  const comments = [];
  let pageToken;
  while (comments.length < maxComments) {
    const response = await youtube.commentThreads.list({ pageToken });
    for (const item of response.data.items) {
      if (comments.length >= maxComments) break;
      const top = item.snippet.topLevelComment.snippet;
      comments.push({ id: item.id, text: top.textDisplay });
      if (includeReplies && item.replies && item.replies.comments) {
        for (const reply of item.replies.comments) {
          if (comments.length >= maxComments) break;
          comments.push({ id: reply.id, text: reply.snippet.textDisplay });
        }
      }
    }
    pageToken = response.data.nextPageToken;
    if (!pageToken) break;
  }
  return comments;
}

(async () => {
  const noReplies = await fetchComments('v1', 10, false);
  assert.strictEqual(noReplies.length, 1, 'top comment only');

  const withReplies = await fetchComments('v1', 10, true);
  assert.strictEqual(withReplies.length, 2, 'should include reply');
  assert.strictEqual(withReplies[1].text, 'reply');
  console.log('fetchCommentsReplies tests passed');
})();
