import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;
let currentChatLanguage: Language | null = null;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
};

export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  const { cropName, soilPH, soilMoisture, climate, nitrogen, phosphorus, potassium } = formData;
  const prompt = `Act as an expert agronomist specializing in organic farming. Recommend fertilizers for: Crop ${cropName}, Soil pH ${soilPH}, Moisture ${soilMoisture}%, Climate ${climate}, NPK ${nitrogen}-${phosphorus}-${potassium}. Provide detailed application instructions in ${language}. Use Markdown.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `Identify the plant and diseases from this image. Recommend organic treatments and preventive measures in ${language}. Additional info: ${promptText || 'None'}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, { text: prompt }] },
  });
  return response.text;
};

export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  const { landSize, cropType, fertilizerType } = formData;
  const prompt = `Calculate organic fertilizer amount for ${landSize} acres of ${cropType} using ${fertilizerType}. Reply in ${language}.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  const prompt = `Find current weather for Lat: ${lat}, Lng: ${lng}. Include farming tip in ${language}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
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
  return JSON.parse(response.text) as Weather;
};

export const findLocalSuppliers = async (type: string, lat: number, lng: number, lang: Language) => {
  const prompt = `Find local shops for ${type} organic fertilizer near my location. Summary and Map links in ${lang}.`;
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
    },
  });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
};

export const textToSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read clearly: ${text.substring(0, 500)}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const sendMessageToChat = async (message: string, language: Language) => {
  if (!chat || currentChatLanguage !== language) {
    chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { 
        systemInstruction: `You are Agri AI, an organic farming expert assistant. Reply in ${language}. Use search for facts.`, 
        tools: [{ googleSearch: {} }] 
      },
    });
    currentChatLanguage = language;
  }
  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};