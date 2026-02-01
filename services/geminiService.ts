
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

/**
 * Google GenAI क्लायंट इनिशियलाइज करा.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gemini SDK कडून येणाऱ्या त्रुटींचे विश्लेषण.
 */
export const parseAiError = (error: any): string => {
  const message = error?.message || String(error);
  const status = error?.status || error?.response?.status;
  
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return "कोटा संपला आहे: कृपया थोड्या वेळाने प्रयत्न करा.";
  }
  if (message.includes('API key not valid')) {
    return "अवैध API की: कृपया तुमची की तपासा.";
  }
  return `AI त्रुटी: ${message.split('\n')[0]}`;
};

const callWithRetry = async (fn: () => Promise<any>, retries = 2): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('503');
    if (retries > 0 && isRetryable) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callWithRetry(fn, retries - 1);
    }
    throw error;
  }
};

const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const testOpenRouterConnection = async () => {
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: "Respond with 'READY'",
    });
    return { success: true, message: "Connected" };
  } catch (error: any) {
    return { success: false, message: parseAiError(error) };
  }
};

const fileToBase64Data = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
};

export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  const prompt = `Act as an expert agronomist. Recommend organic fertilizers for: ${formData.cropName}, Soil pH: ${formData.soilPH}, Moisture: ${formData.soilMoisture}%, Climate: ${formData.climate}, NPK: ${formData.nitrogen}-${formData.phosphorus}-${formData.potassium}. Provide detailed instructions in ${language}. Use Markdown.`;
  try {
    const response = await callWithRetry(() => ai.models.generateContent({ model: DEFAULT_MODEL, contents: prompt }));
    return { text: response.text || "", sources: [] };
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  const base64Image = await fileToBase64Data(imageFile);
  const prompt = `Identify plant diseases or issues and suggest organic treatments in ${language}. Additional info: ${promptText}`;
  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: imageFile.type, data: base64Image } },
          { text: prompt }
        ]
      }
    }));
    return response.text || "";
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  const prompt = `Calculate the amount of organic ${formData.fertilizerType} needed for ${formData.landSize} acres of ${formData.cropType}. Suggest an application schedule in ${language}.`;
  try {
    const response = await callWithRetry(() => ai.models.generateContent({ model: DEFAULT_MODEL, contents: prompt }));
    return { text: response.text || "", sources: [] };
  } catch (error) { throw new Error(parseAiError(error)); }
};

/**
 * USE REAL WEATHER API + GEMINI
 * This uses Open-Meteo for real data and Gemini to generate the recommendation.
 */
export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  try {
    // 1. Fetch real raw data from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    const rawData = await weatherResponse.json();

    if (!rawData.current) throw new Error("Weather data unavailable");

    const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = rawData.current;

    // 2. Use Gemini to interpret this data and get a localized recommendation
    const prompt = `
      The current weather data for coordinates ${lat}, ${lng} is:
      Temp: ${temperature_2m}°C, Humidity: ${relative_humidity_2m}%, Wind: ${wind_speed_10m}km/h, WMO Code: ${weather_code}.
      
      Task:
      1. Map the WMO weather code to a simple condition string (like Clear, Cloudy, Rainy, etc.) in ${language}.
      2. Provide a short, practical organic farming recommendation for this weather in ${language} (max 15 words).
      3. Provide a friendly location name for these coordinates (District/City) in ${language}.
      
      Return strictly JSON.
    `;

    const aiResponse = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            location: { type: Type.STRING },
          },
          required: ["condition", "recommendation", "location"],
        },
      },
    }));

    const interpretation = JSON.parse(aiResponse.text || "{}");

    return {
      temperature: temperature_2m,
      condition: interpretation.condition || "Moderate",
      windSpeed: wind_speed_10m,
      humidity: relative_humidity_2m,
      recommendation: interpretation.recommendation || "Maintain your fields.",
      location: interpretation.location || "Your Farm"
    };
  } catch (error) { 
    console.error("Weather API Error:", error);
    throw new Error(parseAiError(error)); 
  }
};

export const resetChatSession = () => {};

export const textToSpeech = async (text: string): Promise<string> => { return text; };

export const sendMessageToChat = async (message: string, language: Language, history: any[] = []) => {
  const systemInstruction = `You are 'AgriFerti AI', an organic farming expert. Reply in ${language}. Use Markdown.`;
  const contents = [
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: { systemInstruction }
    }));
    return { text: response.text || "", sources: [] };
  } catch (error) { throw new Error(parseAiError(error)); }
};
