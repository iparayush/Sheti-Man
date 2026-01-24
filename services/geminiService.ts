
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

// Multi-key management to bypass single-key quota limits
const getKeys = () => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3
  ].filter(k => k && k.length > 10 && k.startsWith('AIza')) as string[];
  
  return keys.length > 0 ? keys : [process.env.API_KEY || ""];
};

let currentKeyIndex = 0;
let chat: Chat | null = null;
let currentChatLanguage: Language | null = null;

const getActiveKey = () => {
  const keys = getKeys();
  return keys[currentKeyIndex % keys.length];
};

const rotateKey = () => {
  const keys = getKeys();
  if (keys.length > 1) {
    currentKeyIndex++;
    console.warn(`[Sheti Man AI] Rate limit hit. Rotating to key slot ${ (currentKeyIndex % keys.length) + 1 }`);
    resetChatSession();
  }
};

export const resetChatSession = () => {
  chat = null;
  currentChatLanguage = null;
};

/**
 * Handles API calls with automatic key rotation and exponential backoff for 429 errors.
 */
async function withRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 4, delay = 4000): Promise<T> {
  const currentKey = getActiveKey();
  const ai = new GoogleGenAI({ apiKey: currentKey });
  
  try {
    return await fn(ai);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorData = error?.error || error;
    
    // Sometimes error is a string that contains JSON
    if (typeof error === 'string' && error.includes('{')) {
      try { 
        const jsonStr = error.substring(error.indexOf('{'));
        errorData = JSON.parse(jsonStr); 
      } catch(e) {}
    } else if (error?.message && typeof error.message === 'string' && error.message.includes('{')) {
      try {
        const jsonStr = error.message.substring(error.message.indexOf('{'));
        errorData = JSON.parse(jsonStr);
      } catch(e) {}
    }

    const statusCode = String(errorData?.code || error?.status || "");
    const statusText = String(errorData?.status || "").toUpperCase();
    const errorMsg = String(errorData?.message || error?.message || "").toLowerCase();
    
    const isQuotaError = statusCode === "429" || statusText === 'RESOURCE_EXHAUSTED' || errorMsg.includes('quota');

    if (isQuotaError && retries > 0) {
      rotateKey();
      const waitTime = delay + (Math.random() * 2000); // Add jitter
      console.log(`[Sheti Man AI] Quota exhausted. Retrying in ${Math.round(waitTime)}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return withRetry(fn, retries - 1, delay * 1.5);
    }

    if (retries > 0 && (statusCode.startsWith('5') || errorMsg.includes('fetch') || errorMsg.includes('network'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string, mimeType: string } }>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({ inlineData: { data: base64, mimeType: file.type } });
    };
    reader.readAsDataURL(file);
  });
};

export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  const { cropName, soilPH, soilMoisture, climate, nitrogen, phosphorus, potassium } = formData;
  const prompt = `Act as an expert agronomist specializing in organic farming in India. 
  Recommend the best organic fertilizers for: 
  - Crop: ${cropName}
  - Soil pH: ${soilPH}
  - Soil Moisture: ${soilMoisture}%
  - Climate: ${climate}
  - Soil NPK Levels: N:${nitrogen}, P:${phosphorus}, K:${potassium}
  
  Provide detailed application instructions in ${language}. Use Google Search.`;
  
  return withRetry(async (ai) => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { text: response.text ?? "", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
  });
};

export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `Identify plant diseases or pests from this image. Recommend organic treatments in ${language}. Notes: ${promptText || 'None'}`;
  
  return withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text ?? "";
  });
};

export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  const { landSize, cropType, fertilizerType } = formData;
  const prompt = `Calculate exact organic ${fertilizerType} amount for ${landSize} acres of ${cropType}. Reply in ${language}.`;
  
  return withRetry(async (ai) => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { text: response.text ?? "", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
  });
};

export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  const prompt = `Current weather for Lat ${lat}, Lng ${lng} in ${language}. Return JSON ONLY.`;
  
  return withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temperature: { type: Type.NUMBER },
            condition: { type: Type.STRING },
            windSpeed: { type: Type.NUMBER },
            humidity: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
            location: { type: Type.STRING }
          },
          required: ["temperature", "condition", "windSpeed", "humidity", "recommendation", "location"]
        }
      }
    });
    return JSON.parse(response.text ?? "{}") as Weather;
  });
};

export const textToSpeech = async (text: string) => {
  return withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read: ${text.substring(0, 500)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
};

export const sendMessageToChat = async (message: string, language: Language) => {
  return withRetry(async (ai) => {
    if (!chat || currentChatLanguage !== language) {
      chat = ai.chats.create({
        model: 'gemini-3-flash-preview', // Flash has higher rate limits than Pro
        config: { 
          systemInstruction: `You are 'Sheti Man AI', organic farming expert. Reply in ${language}. Use Markdown.`, 
          tools: [{ googleSearch: {} }] 
        },
      });
      currentChatLanguage = language;
    }
    
    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      return { text: response.text ?? "", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
    } catch (err) {
      chat = null; // Clear chat context on error to force a fresh session next time
      throw err;
    }
  });
};
