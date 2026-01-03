import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

export const getPlaceDetails = async (placeName: string) => {
  const prompt = `使用者想去首爾的「${placeName}」。請提供：1. 詳細中文地址(address)。 2. 詳細韓文地址(addressKR, 用於Naver Map導航)。 3. 最適合的類別(category)。 4. 預估人均消費(budget, 韓元)。`;
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      address: { type: Type.STRING },
      addressKR: { type: Type.STRING },
      category: { type: Type.STRING },
      budget: { type: Type.STRING },
    },
    required: ["address", "addressKR", "category", "budget"],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    // The response.text should be valid JSON
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Place Details Error:", error);
    return {};
  }
};

export const getPlaceInsight = async (title: string) => {
  const prompt = `你是韓國旅遊達人。請用繁體中文，針對首爾的景點「${title}」提供：1. 一個有趣的冷知識。 2. 一個附近推薦的必吃美食（含理由）。總字數請控制在 80 字以內，語氣輕鬆活潑。`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "AI 暫時無法回應。";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "AI 連線錯誤。";
  }
};

export const getTripSuggestion = async (titles: string[], day: number) => {
    const placeNames = titles.join(' -> ');
    let prompt = placeNames.length === 0 ? "我目前這一天的行程是空的。請推薦 3 個首爾適合放在一起的景點給我。" : `我正在規劃首爾行程 Day ${day}，順序是：${placeNames}。請用繁體中文分析，給出一個優化建議或推薦下一個景點。50字內。`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });
        return response.text || "暫無建議";
    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        return "AI 連線錯誤。";
    }
};