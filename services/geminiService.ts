import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

// Initialize Gemini Client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "Short descriptive name of the food identified." },
    calories: { type: Type.NUMBER, description: "Estimated total calories." },
    protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
    fat: { type: Type.NUMBER, description: "Estimated fat in grams." },
    servingSize: { type: Type.STRING, description: "The estimated serving size (e.g., '1 cup', '200g')." },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
  },
  required: ["foodName", "calories", "protein", "carbs", "fat"],
};

export async function analyzeFoodText(text: string): Promise<GeminiAnalysisResult> {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this food log entry and estimate nutritional values: "${text}". return reasonable estimates.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are an expert nutritionist. Provide accurate calorie and macro estimates for the described food. If quantities are not specified, assume standard serving sizes.",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as GeminiAnalysisResult;
  } catch (error) {
    console.error("Gemini Text Analysis Error:", error);
    throw new Error("Failed to analyze food text.");
  }
}

export async function analyzeFoodImage(base64Image: string): Promise<GeminiAnalysisResult> {
  const ai = getClient();

  try {
    // Determine mime type roughly or assume jpeg/png based on common canvas outputs
    // The base64 string usually comes with the prefix "data:image/xyz;base64," which we might need to strip if passing as pure bytes,
    // but the SDK helper often wants the raw base64.
    // However, the cleanest way with the new SDK is using the inlineData structure.
    
    // Strip header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/jpeg", // Assuming JPEG for camera captures usually
            },
          },
          {
            text: "Identify this food and estimate its nutritional content.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are an expert nutritionist. Identify the food in the image and provide accurate calorie and macro estimates. Assume standard serving sizes if scale is ambiguous.",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as GeminiAnalysisResult;
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error("Failed to analyze food image.");
  }
}
