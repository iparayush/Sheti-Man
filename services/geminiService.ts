
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

/**
 * Initialize the official Google GenAI client.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    throw new Error('AUTH_ERROR: API Key is missing. Please ensure process.env.API_KEY is configured.');
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

/**
 * Call OpenRouter for the conversational chatbot.
 */
const callOpenRouter = async (prompt: string, language: Language, history: any[] = []) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OpenRouter API key missing.");

  const messages = [
    { 
      role: "system", 
      content: `You are 'shetiman', an expert organic farming advisor. Language: ${language}. Be professional, concise, and helpful to farmers.` 
    },
    ...history,
    { role: "user", content: prompt }
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "shetiman-agri"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages
    })
  });

  if (!response.ok) throw new Error("OpenRouter request failed");
  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Standardizes AI error messages for farmers.
 */
export const parseAiError = (error: any): string => {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();
  
  if (message.includes('429') || lowerMessage.includes('quota')) {
    return "कोटा संपला आहे. कृपया थोड्या वेळाने प्रयत्न करा. (Quota Exceeded)";
  }
  
  if (message.includes('AUTH_ERROR') || lowerMessage.includes('api key')) {
    return "API की समस्या. कृपया कॉन्फिगरेशन तपासा. (API Key Error)";
  }

  return `त्रुटी: ${message.split('\n')[0]}`;
};

const fileToGenerativePart = async (file: File) => {
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: base64Data, mimeType: file.type } };
};

/**
 * Tools using Gemini-3-Flash for speed and precision.
 */
export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  try {
    const ai = getAiClient();
    const prompt = `You are 'shetiman', an organic agronomist. Crop: ${formData.cropName}. Soil pH: ${formData.soilPH}, Moisture: ${formData.soilMoisture}%. NPK: ${formData.nitrogen}-${formData.phosphorus}-${formData.potassium}. Provide a markdown organic plan in ${language}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return { text: response.text || "", sources: [] };
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  try {
    const ai = getAiClient();
    const imagePart = await fileToGenerativePart(imageFile);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: `Identify crop diseases and organic solutions in ${language}. Note: ${promptText || 'None'}` }] },
    });
    return response.text || "";
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  try {
    const ai = getAiClient();
    const prompt = `Calculate organic ${formData.fertilizerType} for ${formData.landSize} acres of ${formData.cropType}. Return markdown steps in ${language}.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return { text: response.text || "", sources: [] };
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  try {
    const ai = getAiClient();
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(weatherUrl);
    const raw = await res.json();
    const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = raw.current;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Temp ${temperature_2m}C, Humid ${relative_humidity_2m}%, Wind ${wind_speed_10m}km/h, Code ${weather_code}. Return JSON for 'condition', 'recommendation', 'location' in ${language}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            location: { type: Type.STRING }
          },
          required: ["condition", "recommendation", "location"]
        }
      }
    });

    const interp = JSON.parse(response.text || "{}");
    return {
      temperature: temperature_2m,
      condition: interp.condition || "Moderate",
      windSpeed: wind_speed_10m,
      humidity: relative_humidity_2m,
      recommendation: interp.recommendation || "नियमित कामे सुरू ठेवा.",
      location: interp.location || "Nearby Farm"
    };
  } catch (error) { throw new Error(parseAiError(error)); }
};

/**
 * Conversational Chatbot powered by OpenRouter.
 */
export const sendMessageToChat = async (message: string, language: Language, history: any[] = []) => {
  try {
    const text = await callOpenRouter(message, language, history);
    return { text: text || "", sources: [] };
  } catch (error) {
    throw new Error(parseAiError(error));
  }
};

/**
 * Professional TTS using Gemini-2.5-TTS.
 */
export const textToSpeech = async (text: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.slice(0, 300) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "BROWSER_TTS_SIGNAL";
  } catch { return "BROWSER_TTS_SIGNAL"; }
};

export const verifyAiStatus = async () => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "READY" });
    return { success: !!response.text, message: "Connected to Gemini" };
  } catch (error: any) { return { success: false, message: parseAiError(error) }; }
};

export const resetChatSession = () => {};
