import fs from 'fs';
import path from 'path';
import { pipeline } from '@xenova/transformers';

export interface SentimentResult {
  label: string;
  score: number;
}

const API_URL = 'https://api-inference.huggingface.co/models/indobenchmark/indobertweet-base-p1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  result: SentimentResult;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
let localPipelinePromise: Promise<(text: string) => Promise<any>> | null = null;

function cacheGet(text: string): SentimentResult | undefined {
  const entry = cache.get(text);
  const now = Date.now();
  if (entry && entry.expires > now) {
    return entry.result;
  }
  if (entry) {
    cache.delete(text);
  }
  return undefined;
}

function cacheSet(text: string, result: SentimentResult): void {
  cache.set(text, { result, expires: Date.now() + CACHE_TTL });
}

function hasLocalModel(): boolean {
  if (process.env.HUGGINGFACE_API_TOKEN) return true;
  const modelDir = path.resolve('models/indobertweet-base-p1');
  return fs.existsSync(modelDir);
}

async function getLocalPipeline() {
  if (!localPipelinePromise) {
    localPipelinePromise = pipeline('sentiment-analysis', 'indobenchmark/indobertweet-base-p1');
  }
  return localPipelinePromise;
}

async function analyzeLocal(text: string): Promise<SentimentResult> {
  const pipe = await getLocalPipeline();
  const output = await pipe(text);
  const arr = Array.isArray(output) ? output : [output];
  let best = arr[0];
  for (const item of arr) {
    if (item.score > best.score) best = item;
  }
  return { label: best.label, score: best.score };
}

async function analyzeRemote(text: string): Promise<SentimentResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.HUGGINGFACE_API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`;
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ inputs: text })
  });
  if (!res.ok) {
    throw new Error(`HuggingFace API error: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Invalid response format');
  let best = data[0];
  for (const item of data) {
    if (item.score > best.score) best = item;
  }
  return { label: best.label, score: best.score };
}

export async function analyze(text: string): Promise<SentimentResult> {
  const cached = cacheGet(text);
  if (cached) return cached;

  let result: SentimentResult;
  if (hasLocalModel()) {
    try {
      result = await analyzeLocal(text);
    } catch (err) {
      console.warn('Local sentiment analysis failed, falling back to API');
      result = await analyzeRemote(text);
    }
  } else {
    result = await analyzeRemote(text);
  }

  cacheSet(text, result);
  return result;
}

