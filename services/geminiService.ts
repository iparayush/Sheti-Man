
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RecommendationFormState, CalculatorFormState, Weather, Language } from '../types';

/**
 * Google GenAI क्लायंट इनिशियलाइज करा.
 * Fixed initialization to match strictly with recommended pattern: new GoogleGenAI({apiKey: process.env.API_KEY})
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gemini SDK कडून येणाऱ्या त्रुटींचे विश्लेषण करून वापरकर्त्याला समजेल असा संदेश तयार करतो.
 */
export const parseAiError = (error: any): string => {
  const message = error?.message || String(error);
  const status = error?.status || error?.response?.status;
  
  console.debug("AI Error Logged:", { message, status, error });

  const currentKey = process.env.API_KEY || "";

  // १. की मधील तफावत तपासणे (उदा. OpenRouter की Gemini SDK मध्ये वापरणे)
  if (currentKey.startsWith('sk-or-')) {
    return "कॉन्फिगरेशन त्रुटी: आपण Google Gemini SDK सोबत OpenRouter API की वापरत आहात. कृपया Google AI Studio कडील 'AIza' ने सुरू होणारी की वापरा किंवा OpenRouter डॅशबोर्ड तपासा.";
  }

  // २. ऑथेंटिकेशन त्रुटी (Invalid Key)
  if (message.includes('API key not valid') || (status === 400 && message.includes('API key'))) {
    return "अवैध API की: तुमची Gemini API की चुकीची आहे किंवा तिची मुदत संपली आहे. कृपया Google AI Studio मध्ये तपासा.";
  }

  // ३. कोटा किंवा दर मर्यादा त्रुटी (429 Quota Exceeded)
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return "कोटा संपला आहे: तुम्ही Gemini च्या मोफत मर्यादेपर्यंत पोहोचला आहात. कृपया काही मिनिटे प्रतीक्षा करा किंवा https://aistudio.google.com/ वर जाऊन कोटा तपासा.";
  }

  // ४. नेटवर्क किंवा सर्व्हर समस्या
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return "कनेक्शन त्रुटी: AI सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा किंवा अ‍ॅड-ब्लॉकर बंद करा.";
  }

  if (status === 500 || status === 503) {
    return "सर्व्हर ओव्हरलोड: सध्या Google चे AI सर्व्हर व्यस्त आहेत. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.";
  }

  // ५. परमिशन किंवा मॉडेल त्रुटी
  if (message.includes('limit: 0') || message.includes('PERMISSION_DENIED')) {
    return "प्रवेश नाकारला: तुमच्या प्रोजेक्टसाठी 'Generative Language API' सक्षम नाही. कृपया Google AI Studio मध्ये हे मॉडेल सुरू करा.";
  }

  if (message.includes('SAFETY')) {
    return "कंटेंट ब्लॉक केला: सुरक्षितता धोरणांमुळे ही विनंती नाकारली गेली. कृपया शेतीशी संबंधित प्रश्न विचारा.";
  }

  // डिफॉल्ट संदेश
  const firstLine = message.split('\n')[0];
  return `AI त्रुटी: ${firstLine}`;
};

/**
 * ट्रान्झियंट त्रुटींसाठी (उदा. 429) रिट्राय लॉजिकसह API कॉल करणे.
 */
const callWithRetry = async (fn: () => Promise<any>, retries = 2): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('503');
    if (retries > 0 && isRetryable) {
      const delay = retries === 2 ? 1500 : 3500;
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1);
    }
    throw error;
  }
};

/**
 * 'gemini-flash-lite-latest' मॉडेलचा वापर, जो मोफत कोटा अधिक स्थिरपणे हाताळतो.
 */
const DEFAULT_MODEL = 'gemini-flash-lite-latest';

export const testOpenRouterConnection = async () => {
  try {
    if (!process.env.API_KEY) throw new Error("API की गहाळ आहे.");

    const response = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: "Respond with 'READY'",
    }));

    return { 
      success: true, 
      message: response.text?.includes('READY') ? "कनेक्ट झाले" : "अनपेक्षित प्रतिसाद"
    };
  } catch (error: any) {
    return { success: false, message: parseAiError(error) };
  }
};

export const resetChatSession = () => {};

const fileToBase64Data = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
};

export const getFertilizerRecommendation = async (formData: RecommendationFormState, language: Language) => {
  const { cropName, soilPH, soilMoisture, climate, nitrogen, phosphorus, potassium } = formData;
  const prompt = `Act as an expert agronomist. Recommend organic fertilizers for: ${cropName}, Soil pH: ${soilPH}, Moisture: ${soilMoisture}%, Climate: ${climate}, NPK: ${nitrogen}-${phosphorus}-${potassium}. Provide detailed instructions in ${language}. Use Markdown.`;
  
  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    }));
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
  const { landSize, cropType, fertilizerType } = formData;
  const prompt = `Calculate the amount of organic ${fertilizerType} needed for ${landSize} acres of ${cropType}. Suggest an application schedule in ${language}.`;
  
  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    }));
    return { text: response.text || "", sources: [] };
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const getWeatherInfo = async (lat: number, lng: number, language: Language): Promise<Weather> => {
  const prompt = `Current weather for ${lat}, ${lng} in ${language}. Return JSON.`;
  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: DEFAULT_MODEL,
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
            location: { type: Type.STRING },
          },
          required: ["temperature", "condition", "windSpeed", "humidity", "recommendation", "location"],
        },
      },
    }));
    return JSON.parse(response.text || "{}") as Weather;
  } catch (error) { throw new Error(parseAiError(error)); }
};

export const textToSpeech = async (text: string): Promise<string> => { return text; };

export const sendMessageToChat = async (message: string, language: Language, history: any[] = []) => {
  const systemInstruction = `You are 'AgriFerti AI', an organic farming expert assistant. Help farmers with sustainable practices. Reply in ${language}. Use Markdown.`;
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
