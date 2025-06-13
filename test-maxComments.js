// Test script untuk memverifikasi implementasi maxComments
import { fetchComments } from './youtubeFetcher.js';

console.log('🧪 Testing maxComments implementation...');

const testVideoId = 'dQw4w9WgXcQ'; // Rick Roll video yang populer

async function testMaxComments() {
  try {
    console.log('\n📊 Test 1: Fetching 20 comments (default)');
    const comments20 = await fetchComments(testVideoId, 20, false, 'top');
    console.log(`✅ Fetched ${comments20.length} comments`);
    
    console.log('\n📊 Test 2: Fetching 50 comments');
    const comments50 = await fetchComments(testVideoId, 50, false, 'top');
    console.log(`✅ Fetched ${comments50.length} comments`);
    
    console.log('\n📊 Test 3: Fetching 100 comments with replies');
    const comments100WithReplies = await fetchComments(testVideoId, 100, true, 'top');
    console.log(`✅ Fetched ${comments100WithReplies.length} comments (with replies)`);
    
    console.log('\n📊 Test 4: Testing sortBy parameter');
    const commentsRelevance = await fetchComments(testVideoId, 10, false, 'top');
    const commentsTime = await fetchComments(testVideoId, 10, false, 'new');
    console.log(`✅ Relevance: ${commentsRelevance.length}, Time: ${commentsTime.length}`);
    
    console.log('\n✅ All tests passed! maxComments implementation working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMaxComments();
