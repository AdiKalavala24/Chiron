import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Override with EXPO_PUBLIC_GEMINI_MODEL if you need to pin/bump the model without a code change.
const modelId = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

let cachedClient: GoogleGenerativeAI | null = null;

export function isGeminiConfigured(): boolean {
  return !!apiKey;
}

/** Returns null when no API key is configured — every caller must treat that as "use the offline fallback," not an error. */
export function getGeminiModel(): GenerativeModel | null {
  if (!apiKey) return null;
  if (!cachedClient) cachedClient = new GoogleGenerativeAI(apiKey);
  return cachedClient.getGenerativeModel({ model: modelId });
}
