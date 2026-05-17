import { StandardAIResponse } from './types';

export function normalizeAIResponse<T>(rawResponse: string): StandardAIResponse<T> {
  try {
    // 1. Clean the string: Remove markdown code blocks if the AI added them
    let cleanedResponse = rawResponse.trim();
    
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json/, '').replace(/
```$/, '').trim();
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```/, '').replace(/```$/, '').trim();
    }

    // 2. Parse the clean string into a JSON object
    const parsedData = JSON.parse(cleanedResponse) as T;

    // 3. Return our standard, predictable package
    return {
      success: true,
      data: parsedData,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gemini', // Defaulting to gemini as a placeholder
      }
    };
  } catch (error) {
    console.error("AI Normalization Error:", error);
    // If the AI gives us complete garbage that can't be parsed, we return a safe error instead of crashing
    return {
      success: false,
      data: null,
      error: 'Failed to parse AI response into structured format.',
    };
  }
}