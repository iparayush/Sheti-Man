
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

/**
 * OpenRouter API Configuration
 */
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// We use the injected key or fallback to the provided one
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "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";
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

/**
 * Standardizes AI error messages for farmers.
 */
export const parseAiError = (error: any): string => {
  const message = error?.message || String(error);
  
  if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
    return "QUOTA_EXCEEDED: कोटा संपला आहे. कृपया थोड्या वेळाने प्रयत्न करा.";
  }
  
  if (message.includes('401') || message.includes('Unauthorized')) {
    return "AUTH_ERROR: OpenRouter API की अवैध आहे.";
  }
  
  return `त्रुटी: ${message.split('\n')[0]}`;
};

/**
 * Core function to call OpenRouter via REST
 */
const callOpenRouter = async (messages: any[], jsonMode = false) => {
  if (!OPENROUTER_KEY) {
    throw new Error("OpenRouter API key is missing.");
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "shetiman",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw error;
  }
};

/**
 * Converts File to base64 string for vision analysis.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Expert organic fertilizer advice.
 */
export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  try {
    const systemPrompt = `You are 'shetiman', a senior organic agronomist. Language: ${language}.
    Rules:
    1. Use Markdown for ALL output.
    2. Suggest specific organic fertilizers like Jeevamrut, Vermicompost, or Neem Cake.
    3. Use clean headers (###) and bold text.`;

    const userPrompt = `Generate a fertilizer plan for: ${formData.cropName}.
    - Soil pH: ${formData.soilPH}
    - Moisture: ${formData.soilMoisture}%
    - Climate: ${formData.climate}
    - NPK: N=${formData.nitrogen}, P=${formData.phosphorus}, K=${formData.potassium}.`;

    const text = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    return { text: text || "", sources: [] };
  } catch (error) {
    throw new Error(parseAiError(error));
  }
};

/**
 * Vision-based disease analysis via OpenRouter multimodal format.
 */
export const analyzeCropImage = async (imageFile: File, promptText: string, language: Language) => {
  try {
    const base64Image = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Identify diseases from this crop image and suggest organic remedies in ${language}. Notes: ${promptText || 'None'}. Use professional Markdown.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ];

    const text = await callOpenRouter(messages);
    return text || "";
  } catch (error) {
    throw new Error(parseAiError(error));
  }
};

/**
 * Precise dosage calculation for organic farming.
 */
export const calculateFertilizer = async (formData: CalculatorFormState, language: Language) => {
  try {
    const prompt = `Calculate exactly how much ${formData.fertilizerType} is needed for ${formData.landSize} acres of ${formData.cropType}. 
    Return calculation in ${language} with Markdown steps.`;

    const text = await callOpenRouter([{ role: "user", content: prompt }]);
    return { text: text || "", sources: [] };
  } catch (error) {
    throw new Error(parseAiError(error));
  }
};

/**
 * Intelligent weather farm advice.
 */
export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(weatherUrl);
    const raw = await res.json();
    
    const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = raw.current;

    const systemPrompt = `You are a weather analysis bot for farmers. Language: ${language}.
    Return a valid JSON object with exactly:
    { "condition": "Brief description", "recommendation": "One sentence farm advice", "location": "General area" }`;

    const userPrompt = `Weather Data: Temp ${temperature_2m}°C, Humidity ${relative_humidity_2m}%, Wind ${wind_speed_10m}km/h, WMO Code ${weather_code}`;

    const jsonResponse = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], true);

    const interpretation = JSON.parse(jsonResponse || "{}");

    return {
      temperature: temperature_2m,
      condition: interpretation.condition || "Moderate",
      windSpeed: wind_speed_10m,
      humidity: relative_humidity_2m,
      recommendation: interpretation.recommendation || "नियमित कामे सुरू ठेवा.",
      location: interpretation.location || "Nearby Area"
    };
  } catch (error) { 
    throw new Error(parseAiError(error)); 
  }
};

/**
 * Conversational farming assistant.
 */
export const sendMessageToChat = async (message: string, language: Language, history: any[] = []) => {
  try {
    const systemPrompt = `You are 'shetiman', an expert AI agricultural advisor. Language: ${language}. 
    Suggest organic Indian farming solutions. Be helpful and concise.`;

    const formattedHistory = history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    }));

    const text = await callOpenRouter([
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: message }
    ]);

    return { text: text || "", sources: [] };
  } catch (error) {
    throw new Error(parseAiError(error));
  }
};

/**
 * Browser TTS Signal.
 */
export const textToSpeech = async (text: string): Promise<string> => {
  return "BROWSER_TTS_SIGNAL"; 
};

/**
 * Verify OpenRouter connectivity.
 */
export const verifyAiStatus = async () => {
  try {
    const response = await callOpenRouter([{ role: "user", content: "Respond with 'ACTIVE'." }]);
    return { success: response?.includes('ACTIVE'), message: "Connected via OpenRouter" };
  } catch (error: any) {
    return { success: false, message: parseAiError(error) };
  }
};

export const resetChatSession = () => {};
