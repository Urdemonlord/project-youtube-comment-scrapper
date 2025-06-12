// Simple rule-based comment classifier
// Categories: Kritik Konstruktif, Penghinaan, Ujaran Kebencian, Netral/Positif, Spam/Tidak Relevan

/**
 * @typedef {Object} ClassificationResult
 * @property {string} klasifikasi
 * @property {string} alasan
 */

/**
 * Classify a single comment text based on simple keyword heuristics.
 * @param {string} text
 * @returns {ClassificationResult}
 */
export function classifyComment(text) {
  const lower = text.toLowerCase();

  // Spam or irrelevant
  const spamPatterns = [/https?:\/\//, /www\./, /subscribe/, /klik link/, /promo/];
  if (spamPatterns.some((r) => r.test(lower)) || lower.trim().length === 0) {
    return {
      klasifikasi: 'Spam/Tidak Relevan',
      alasan: 'Komentar mengandung promosi atau tautan yang tidak relevan.'
    };
  }

  // Hate speech (very naive check)
  const hateWords = [/\bkafir\b/, /\baseng\b/, /\bbabi\b/, /\brasis\b/, /\bnazi\b/];
  if (hateWords.some((r) => r.test(lower))) {
    return {
      klasifikasi: 'Ujaran Kebencian',
      alasan: 'Komentar menyerang kelompok identitas.'
    };
  }

  // Direct insult
  const insults = [
    /\bbodoh\b/,
    /\bgoblok\b/,
    /\bgoblog\b/,
    /\bidiot\b/,
    /\btolol\b/,
    /\bbego\b/,
    /\banjing\b/,
    /\bbangsat\b/,
    /\bkampret\b/,
    /\bjelek\b/,
    /\bsampah\b/,
    /\bugly\b/,
    /\btrash\b/,
    /\bnasty\b/,
    /\bshitty\b/,
    /\btoxic\b/,
    /\btoxik\b/
  ];
  if (insults.some((r) => r.test(lower))) {
    return { klasifikasi: 'Penghinaan', alasan: 'Komentar menyerang individu.' };
  }

  // Constructive critique
  const critiqueHints = [/\btapi\b/, /\bnamun\b/, /\bsebaiknya\b/, /\bmungkin\b/, /\bharusnya\b/, /\bseharusnya\b/, /\bcoba\b/];
  if (critiqueHints.some((r) => r.test(lower))) {
    return {
      klasifikasi: 'Kritik Konstruktif',
      alasan: 'Komentar memberikan evaluasi beserta saran.'
    };
  }

  // Default
  return {
    klasifikasi: 'Netral/Positif',
    alasan: 'Komentar tidak mengandung unsur negatif yang jelas.'
  };
}
