import { pipeline } from '@xenova/transformers';

let sentimentClassifier;
let toxicityClassifier;

/**
 * Analyze an array of comments using IndoBERT-based models.
 * Returns an object similar to analyzeWithGemini result.
 * @param {string[]} texts
 */
export async function analyzeWithIndoBert(texts) {
  if (!sentimentClassifier) {
    sentimentClassifier = await pipeline('sentiment-analysis', 'indobenchmark/indobert-base-p1');
  }
  if (!toxicityClassifier) {
    try {
      toxicityClassifier = await pipeline('text-classification', 'indobenchmark/indobert-base-p1');
    } catch (err) {
      // Fallback to sentiment model if specific toxicity model unavailable
      toxicityClassifier = sentimentClassifier;
    }
  }

  const sentimentResults = await sentimentClassifier(texts);
  const toxicityResults = await toxicityClassifier(texts);

  return {
    comments: texts.map((text, i) => ({
      text,
      sentiment: mapSentiment(sentimentResults[i]),
      toxicity: {
        overall: toxicityResults[i].score,
        categories: {
          identity_attack: toxicityResults[i].score,
          insult: toxicityResults[i].score,
          obscene: toxicityResults[i].score,
          severe_toxicity: toxicityResults[i].score,
          sexual_explicit: toxicityResults[i].score,
          threat: toxicityResults[i].score,
          toxicity: toxicityResults[i].score
        },
        confidence: toxicityResults[i].score
      },
      categories: ['general']
    })),
    overall_sentiment: {
      score: sentimentResults.reduce((sum, r) => sum + mapSentiment(r), 0) / texts.length,
      distribution: { very_negative: 0, negative: 0, neutral: texts.length, positive: 0, very_positive: 0 }
    },
    toxicity_summary: {
      average_score: toxicityResults.reduce((s, r) => s + r.score, 0) / texts.length,
      distribution: { low: texts.length, medium: 0, high: 0, severe: 0 },
      category_counts: { identity_attack: 0, insult: 0, obscene: 0, severe_toxicity: 0, sexual_explicit: 0, threat: 0 }
    },
    topics: [],
    keywords: []
  };
}

function mapSentiment(result) {
  if (!result || typeof result.score !== 'number') return 0;
  if (result.label.toLowerCase().includes('positive')) return result.score;
  if (result.label.toLowerCase().includes('negative')) return -result.score;
  return 0;
}

export default analyzeWithIndoBert;
