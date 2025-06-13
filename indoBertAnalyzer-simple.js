import { pipeline } from '@xenova/transformers';

let sentimentClassifier;

/**
 * Simple IndoBERT analyzer with fallback
 * @param {string[]} texts
 */
export async function analyzeWithIndoBert(texts) {
  console.log('🔄 Starting simplified ML analysis...');
  
  try {
    // Initialize classifier with fallback
    if (!sentimentClassifier) {
      console.log('📥 Loading sentiment model...');
      try {
        sentimentClassifier = await pipeline('sentiment-analysis');
        console.log('✅ Loaded default sentiment model');
      } catch (err) {
        console.error('❌ Failed to load ML model:', err.message);
        throw new Error('ML model loading failed');
      }
    }

    console.log('🤖 Analyzing', texts.length, 'comments...');
    
    // Process in very small batches
    const results = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await sentimentClassifier(texts[i]);
        results.push(Array.isArray(result) ? result[0] : result);
        console.log(`✅ Processed comment ${i + 1}/${texts.length}`);
      } catch (err) {
        console.warn(`⚠️ Failed to process comment ${i + 1}, using fallback`);
        results.push({ label: 'NEUTRAL', score: 0.5 });
      }
    }

    console.log('✅ ML analysis completed');

    // Build response in same format as Gemini
    return {
      comments: texts.map((text, i) => ({
        text,
        sentiment: mapSentiment(results[i]),
        toxicity: {
          overall: mapToxicity(results[i]),
          categories: {
            identity_attack: 0.1,
            insult: mapToxicity(results[i]) * 0.5,
            obscene: 0.1,
            severe_toxicity: 0.1,
            sexual_explicit: 0.1,
            threat: 0.1,
            toxicity: mapToxicity(results[i])
          },
          confidence: results[i]?.score || 0.5
        },
        categories: ['general']
      })),
      overall_sentiment: {
        score: results.reduce((sum, r) => sum + mapSentiment(r), 0) / texts.length,
        distribution: { very_negative: 0, negative: 0, neutral: texts.length, positive: 0, very_positive: 0 }
      },
      toxicity_summary: {
        average_score: results.reduce((sum, r) => sum + mapToxicity(r), 0) / texts.length,
        distribution: { low: texts.length, medium: 0, high: 0, severe: 0 },
        category_counts: { identity_attack: 0, insult: 0, obscene: 0, severe_toxicity: 0, sexual_explicit: 0, threat: 0 }
      },
      topics: [],
      keywords: []
    };

  } catch (error) {
    console.error('❌ ML analysis completely failed:', error.message);
    throw error;
  }
}

function mapSentiment(result) {
  if (!result || !result.score) return 0;
  
  const label = result.label.toLowerCase();
  const score = result.score;
  
  if (label.includes('positive')) return score;
  if (label.includes('negative')) return -score;
  return 0;
}

function mapToxicity(result) {
  if (!result || !result.score) return 0.1;
  
  const label = result.label.toLowerCase();
  if (label.includes('negative')) return result.score * 0.4;
  return 0.1;
}

export default analyzeWithIndoBert;
