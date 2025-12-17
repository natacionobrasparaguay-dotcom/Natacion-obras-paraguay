import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation, ExperienceLevel, ActivityType, ClassType } from "../types";

export const getSwimmingRecommendation = async (
  age: number, 
  selfReportedLevel: string,
  activityType: ActivityType,
  classType: ClassType
): Promise<AIRecommendation> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return {
      recommendedLevel: ExperienceLevel.INTERMEDIATE,
      focusArea: "Técnica general",
      motivationTip: "¡Bienvenido a Natación Obras Paraguay!",
      reasoning: "Modo demo activo."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as an expert swimming coordinator for "Natación Obras Paraguay".
    I have a potential student. 
    Age: ${age} years old.
    Self-reported experience: "${selfReportedLevel}".
    Interested in Activity: "${activityType}".
    Preferred Class Type: "${classType}".
    
    Context:
    - Kids (4-12) only have group swimming at 17:00-19:00.
    - Adults have group classes at 16:00, 19:00, 20:00.
    - Aquagym is available for adults.
    
    Determine the most appropriate standard level for them (Principiante, Intermedio, Avanzado, Competitivo).
    Identify a key technical focus area suitable for this profile and activity (e.g., for Aquagym focus on rhythm/resistance, for Swimming focus on stroke).
    Write a short, inspiring motivation tip (max 15 words).
    Explain your reasoning briefly, mentioning if their choice fits their age group nicely.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedLevel: { type: Type.STRING, enum: Object.values(ExperienceLevel) },
            focusArea: { type: Type.STRING },
            motivationTip: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["recommendedLevel", "focusArea", "motivationTip", "reasoning"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIRecommendation;
    }
    
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      recommendedLevel: ExperienceLevel.BEGINNER,
      focusArea: "Adaptación y disfrute",
      motivationTip: "El movimiento es vida, ¡disfruta el agua!",
      reasoning: "Error de conexión, asignación por defecto."
    };
  }
};