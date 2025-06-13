/**
 * Simple fallback analyzer that mimics ML behavior
 * @param {string[]} texts
 */
export async function analyzeWithIndoBert(texts) {
  console.log('🔄 Starting simple keyword-based analysis...');
  
  try {
    // Simple keyword-based analysis (fallback)
    const positiveKeywords = ['good', 'great', 'awesome', 'amazing', 'love', 'best', 'fantastic', 'excellent', 'wonderful', 'perfect', 'bagus', 'keren', 'mantap'];
    const negativeKeywords = ['bad', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'disgusting', 'annoying', 'boring', 'jelek', 'buruk', 'gak suka'];
    
    console.log('🤖 Analyzing', texts.length, 'comments with keyword matching...');
    
    const results = texts.map((text, i) => {
      console.log(`✅ Processed comment ${i + 1}/${texts.length}`);
      
      const lowerText = text.toLowerCase();
      
      // Count positive and negative keywords
      const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
      
      // Calculate sentiment (-1 to 1)
      let sentiment = 0;
      if (positiveCount > negativeCount) {
        sentiment = Math.min(0.8, positiveCount * 0.3);
      } else if (negativeCount > positiveCount) {
        sentiment = Math.max(-0.8, -negativeCount * 0.3);
      }
      
      // Calculate toxicity (0 to 1)
      const toxicKeywords = ['bodoh', 'goblok', 'idiot', 'stupid', 'hate', 'kill', 'die', 'anjing', 'bangsat'];
      const toxicCount = toxicKeywords.filter(word => lowerText.includes(word)).length;
      const toxicity = Math.min(0.9, toxicCount * 0.4);
      
      return {
        sentiment,
        toxicity,
        label: sentiment > 0.2 ? 'POSITIVE' : sentiment < -0.2 ? 'NEGATIVE' : 'NEUTRAL',
        score: Math.abs(sentiment) || 0.5
      };
    });

    console.log('✅ Keyword-based analysis completed');

    // Build response in same format as Gemini
    return {
      comments: texts.map((text, i) => ({
        text,
        sentiment: results[i].sentiment,
        toxicity: {
          overall: results[i].toxicity,
          categories: {
            identity_attack: results[i].toxicity * 0.3,
            insult: results[i].toxicity * 0.5,
            obscene: results[i].toxicity * 0.3,
            severe_toxicity: results[i].toxicity * 0.2,
            sexual_explicit: results[i].toxicity * 0.1,
            threat: results[i].toxicity * 0.2,
            toxicity: results[i].toxicity
          },
          confidence: results[i].score
        },
        categories: results[i].toxicity > 0.3 ? ['potentially_toxic'] : ['general']
      })),
      overall_sentiment: {
        score: results.reduce((sum, r) => sum + r.sentiment, 0) / texts.length,
        distribution: calculateDistribution(results, 'sentiment')
      },
      toxicity_summary: {
        average_score: results.reduce((sum, r) => sum + r.toxicity, 0) / texts.length,
        distribution: calculateDistribution(results, 'toxicity'),
        category_counts: {
          identity_attack: results.filter(r => r.toxicity > 0.3).length,
          insult: results.filter(r => r.toxicity > 0.4).length,
          obscene: results.filter(r => r.toxicity > 0.3).length,
          severe_toxicity: results.filter(r => r.toxicity > 0.7).length,
          sexual_explicit: 0,
          threat: results.filter(r => r.toxicity > 0.5).length
        }
      },
      topics: extractTopics(texts),
      keywords: extractKeywords(texts)
    };

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    throw error;
  }
}

function calculateDistribution(results, type) {
  if (type === 'sentiment') {
    const distribution = { very_negative: 0, negative: 0, neutral: 0, positive: 0, very_positive: 0 };
    results.forEach(r => {
      if (r.sentiment < -0.6) distribution.very_negative++;
      else if (r.sentiment < -0.2) distribution.negative++;
      else if (r.sentiment < 0.2) distribution.neutral++;
      else if (r.sentiment < 0.6) distribution.positive++;
      else distribution.very_positive++;
    });
    return distribution;
  } else {
    const distribution = { low: 0, medium: 0, high: 0, severe: 0 };
    results.forEach(r => {
      if (r.toxicity < 0.2) distribution.low++;
      else if (r.toxicity < 0.5) distribution.medium++;
      else if (r.toxicity < 0.8) distribution.high++;
      else distribution.severe++;
    });
    return distribution;
  }
}

function extractTopics(texts) {
  const topics = [
    { name: 'general discussion', count: texts.length, sentiment: 0 }
  ];
  
  const musicKeywords = ['musik', 'lagu', 'song', 'music', 'beat'];
  const musicCount = texts.filter(text => 
    musicKeywords.some(keyword => text.toLowerCase().includes(keyword))
  ).length;
  
  if (musicCount > 0) {
    topics.push({ name: 'music', count: musicCount, sentiment: 0.2 });
  }
  
  return topics;
}

function extractKeywords(texts) {
  const allWords = texts.join(' ').toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
    
  const wordCount = {};
  allWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({
      word,
      count,
      sentiment: 0
    }));
}

export default analyzeWithIndoBert;
