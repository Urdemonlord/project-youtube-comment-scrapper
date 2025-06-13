// Test script untuk memverifikasi perbaikan IndoBERT
import { analyzeWithIndoBert } from './indoBertAnalyzer.js';

console.log('🧪 Testing IndoBERT implementation...');

async function testIndoBERT() {
  try {
    const testComments = [
      'Video ini bagus sekali!',
      'Gak suka, jelek banget',
      'Biasa aja sih',
      'Kamu bodoh banget anjing'
    ];
    
    console.log('\n📊 Testing with sample comments...');
    const result = await analyzeWithIndoBert(testComments);
    
    console.log('\n✅ Results:');
    result.comments.forEach((comment, i) => {
      console.log(`${i + 1}. "${comment.text}"`);
      console.log(`   Sentiment: ${comment.sentiment.toFixed(2)}`);
      console.log(`   Toxicity: ${comment.toxicity.overall.toFixed(2)}`);
      console.log(`   Category: ${comment.categories[0]}`);
    });
    
    console.log('\n📈 Overall Stats:');
    console.log(`Overall Sentiment: ${result.overall_sentiment.score.toFixed(2)}`);
    console.log(`Average Toxicity: ${result.toxicity_summary.average_score.toFixed(2)}`);
    console.log(`Topics: ${result.topics.map(t => t.name).join(', ')}`);
    console.log(`Keywords: ${result.keywords.map(k => k.word).join(', ')}`);
    
    console.log('\n✅ All IndoBERT tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIndoBERT();
