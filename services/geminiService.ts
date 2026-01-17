
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

// Use process.env.API_KEY directly as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;
let currentChatLanguage: Language | null = null;

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
  
  Provide detailed application instructions, dosage, and timing in ${language}. Use Markdown formatting with clear headings. Use Google Search to ensure up-to-date regional practices.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text ?? "", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `You are a professional plant pathology AI. Identify the plant and any visible diseases, pests, or nutrient deficiencies from this image. 
  Recommend specific organic treatments, soil improvements, and preventive measures suitable for small-scale farmers. 
  Reply in ${language}. Use Markdown. Additional user notes: ${promptText || 'None'}`;
  
  // Use gemini-3-flash-preview for general multimodal text-generation tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: prompt }] },
  });
  return response.text ?? "";
};

export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  const { landSize, cropType, fertilizerType } = formData;
  const prompt = `Act as a farm management consultant. 
  Calculate the exact amount of ${fertilizerType} required for ${landSize} acres of ${cropType}. 
  Include application frequency and seasonal advice. 
  Reply in ${language}. Use Markdown with calculation steps shown clearly.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text ?? "", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  const prompt = `Find real-time weather at Latitude ${lat}, Longitude ${lng}. 
  Include: temperature (Celsius), sky condition, wind speed (km/h), humidity (%). 
  Also provide a brief agricultural tip based on these conditions for an organic farmer. 
  Reply in ${language}. Output strictly as a JSON object matching this schema: 
  { temperature: number, condition: string, windSpeed: number, humidity: number, recommendation: string, location: string }`;
  
  // Note: Grounding with search can make JSON parsing difficult, so we handle it gracefully.
  // We remove the explicit responseSchema here to allow the model to provide search context if needed, 
  // but ask for JSON in the prompt.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text ?? "";
  try {
    // Attempt to extract JSON block from potentially cited text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Weather;
    }
  } catch (e) {
    console.warn("Weather parsing failed, returning placeholder", e);
  }

  return {
    temperature: 25,
    condition: "Sunny",
    windSpeed: 10,
    humidity: 50,
    recommendation: "Check local news for real-time updates.",
    location: "Unknown Location"
  };
};

export const textToSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this advice clearly for a farmer: ${text.substring(0, 800)}` }] }],
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
        systemInstruction: `You are 'Sheti Man AI', an expert assistant for Indian farmers. 
        You specialize in organic and sustainable farming. 
        Always provide practical, cost-effective, and environmentally friendly solutions. 
        If asked about modern tools or trends, use search to find latest facts. 
        Reply in ${language}. Use Markdown.`, 
        tools: [{ googleSearch: {} }] 
      },
    });
    currentChatLanguage = language;
  }
  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return { text: response.text ?? "", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};
