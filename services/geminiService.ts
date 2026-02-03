
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

/**
 * Validates and retrieves the Google Gemini Client
 */
const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') return null;
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

/**
 * Standardized OpenRouter Caller for fallback
 */
const callOpenRouter = async (prompt: string, language: Language, history: any[] = [], imageBase64?: string, mimeType?: string) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'undefined') throw new Error("OpenRouter Key Missing");

  const messages: any[] = [
    { 
      role: "system", 
      content: `You are 'shetiman', an expert AI organic farming advisor. Language: ${language}. Be professional, empathetic, and concise.` 
    },
    ...history
  ];

  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
      ]
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "shetiman-agri"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite-001", // High reliability backup
      messages
    })
  });

  if (!response.ok) throw new Error("Backup AI Failed");
  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Standardizes AI error messages
 */
export const parseAiError = (error: any): string => {
  const message = error?.message || String(error);
  if (message.includes('AUTH_ERROR')) return "API Key Error: Please check your configuration.";
  if (message.includes('429')) return "Traffic high. Trying backup...";
  return `Error: ${message.split('\n')[0]}`;
};

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
};

/**
 * AI Tool: Fertilizer Recommendation with Fallback
 */
export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  const prompt = `Senior Agronomist Plan. Language: ${language}. Crop: ${formData.cropName}. Soil pH: ${formData.soilPH}, NPK: ${formData.nitrogen}-${formData.phosphorus}-${formData.potassium}. Provide organic plan in Markdown.`;
  
  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error("Gemini Unavailable");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return { text: response.text || "", sources: [] };
  } catch (error) {
    console.warn("Gemini failed, falling back to OpenRouter", error);
    const text = await callOpenRouter(prompt, language);
    return { text: text || "", sources: [] };
  }
};

/**
 * AI Tool: Crop Doctor (Vision) with Fallback
 */
export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  const prompt = `Identify crop diseases and suggest organic remedies in ${language}. Additional user notes: ${promptText || 'None'}`;
  const base64 = await fileToBase64(imageFile);

  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error("Gemini Unavailable");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { data: base64, mimeType: imageFile.type } }, { text: prompt }] },
    });
    return response.text || "";
  } catch (error) {
    console.warn("Vision fallback triggered", error);
    return await callOpenRouter(prompt, language, [], base64, imageFile.type);
  }
};

/**
 * AI Tool: Calculator with Fallback
 */
export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  const prompt = `Calculate exact organic ${formData.fertilizerType} dosage for ${formData.landSize} acres of ${formData.cropType}. Language: ${language}. Use Markdown.`;
  
  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error("Gemini Unavailable");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return { text: response.text || "", sources: [] };
  } catch (error) {
    const text = await callOpenRouter(prompt, language);
    return { text: text || "", sources: [] };
  }
};

/**
 * AI Tool: Weather Advice with Fallback
 */
export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
  const res = await fetch(weatherUrl);
  const raw = await res.json();
  const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m, wind_direction_10m } = raw.current;

  const prompt = `Weather Data: Temp ${temperature_2m}C, Humidity ${relative_humidity_2m}%, Wind Speed ${wind_speed_10m}km/h, Wind Direction ${wind_direction_10m} degrees. 
  Please provide farming advice in ${language}. 
  Return JSON: { 
    "condition": "string", 
    "recommendation": "string", 
    "location": "string",
    "windDirection": "string (e.g. North, NE, or localized direction name)"
  }.`;
  
  let result;
  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error("Gemini Unavailable");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            location: { type: Type.STRING },
            windDirection: { type: Type.STRING }
          },
          required: ["condition", "recommendation", "location", "windDirection"]
        }
      }
    });
    result = JSON.parse(response.text || "{}");
  } catch {
    const text = await callOpenRouter(prompt, language);
    try {
      result = JSON.parse(text.match(/\{.*\}/s)?.[0] || "{}");
    } catch {
      result = { condition: "Moderate", recommendation: "काम सुरू ठेवा.", location: "Farm", windDirection: `${wind_direction_10m}°` };
    }
  }

  return {
    temperature: temperature_2m,
    condition: result.condition || "Clear",
    windSpeed: wind_speed_10m,
    windDirection: result.windDirection || `${wind_direction_10m}°`,
    humidity: relative_humidity_2m,
    recommendation: result.recommendation || "नियमित कामे सुरू ठेवा.",
    location: result.location || "Nearby"
  };
};

/**
 * AI Tool: Conversational Chat with Fallback
 */
export const sendMessageToChat = async (message: string, language: Language, history: any[] = []) => {
  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error("Gemini Unavailable");
    
    // We use a simple generateContent for high frequency chat to stay in free tier
    const prompt = `Chat History: ${JSON.stringify(history.slice(-4))}\n\nUser Question: ${message}\n\nLanguage: ${language}. Answer as 'shetiman' expert.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return { text: response.text || "", sources: [] };
  } catch (error) {
    console.warn("Chat fallback triggered");
    const text = await callOpenRouter(message, language, history);
    return { text: text || "", sources: [] };
  }
};

/**
 * AI Tool: Professional TTS
 */
export const textToSpeech = async (text: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.slice(0, 300) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "BROWSER_TTS_SIGNAL";
  } catch {
    return "BROWSER_TTS_SIGNAL";
  }
};

export const verifyAiStatus = async () => {
  const gemini = getGeminiClient();
  const orKey = process.env.OPENROUTER_API_KEY;
  if (!gemini && !orKey) return { success: false, message: "AUTH_ERROR: Both AI providers missing keys." };
  return { success: true, message: "AI Systems Ready" };
};

export const resetChatSession = () => {};
