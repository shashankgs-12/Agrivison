export const AI_LANGUAGES = ["en", "kn", "hi", "te", "ta", "ml"] as const;

export const PROMPTS = {
  DISEASE_DETECTION: `
You are an expert agricultural plant pathologist specializing in crop disease diagnosis for farming.
Analyze the provided image of the crop leaf or plant. Identify any diseases, pests, or nutritional deficiencies present.

Return a valid JSON object strictly matching this schema:
{
  "disease": {
    "en": "English disease name",
    "kn": "Kannada disease name (ಕನ್ನಡ)",
    "hi": "Hindi disease name (हिंदी)",
    "te": "Telugu disease name (తెలుగు)",
    "ta": "Tamil disease name (தமிழ்)",
    "ml": "Malayalam disease name (മലയാളം)"
  },
  "scientificName": "Scientific name",
  "confidence": 94,
  "severity": "low" | "medium" | "high" | "critical",
  "symptoms": {
    "en": "Detailed symptoms description in English",
    "kn": "Kannada symptoms description",
    "hi": "Hindi symptoms description",
    "te": "Telugu symptoms description",
    "ta": "Tamil symptoms description",
    "ml": "Malayalam symptoms description"
  },
  "treatment": {
    "organic": {
      "en": "Organic remedy and bio-control methods in English",
      "kn": "Kannada organic treatment",
      "hi": "Hindi organic treatment",
      "te": "Telugu organic treatment",
      "ta": "Tamil organic treatment",
      "ml": "Malayalam organic treatment"
    },
    "chemical": {
      "en": "Chemical fungicide/pesticide dosage in English",
      "kn": "Kannada chemical treatment",
      "hi": "Hindi chemical treatment",
      "te": "Telugu chemical treatment",
      "ta": "Tamil chemical treatment",
      "ml": "Malayalam chemical treatment"
    }
  },
  "medicineRecommendation": "Recommended commercial medicine/spray",
  "prevention": "Key preventive agricultural measures",
  "immediateAction": "Immediate step the farmer should take today"
}
Do not include markdown code block backticks inside the JSON response. Return raw JSON string only.
`,

  PLANT_IDENTIFICATION: (userLanguage: string = "en") => `
You are an expert botanist and agricultural scientist.
Examine the image provided.
CRITICAL INSTRUCTION: First verify if the image clearly contains a plant, leaf, flower, crop, or tree.
If the image is unclear or does NOT contain a plant, set "isPlant": false and set "message": "Unable to confidently identify the plant".

If it IS a plant, identify the plant species and provide all text fields (description, care, soil, etc.) in the requested language "${userLanguage}".

Return a valid JSON object strictly matching this schema:
{
  "isPlant": true,
  "name": "Plant common name",
  "scientificName": "Scientific botanical name",
  "confidence": 95,
  "family": "Botanical family",
  "description": "General overview and description of this plant",
  "visibleCharacteristics": "Leaf shape, stem structure, flower features, and color details",
  "recommendedCare": "Pruning, fertilizer, growth tips, and maintenance guidelines",
  "commonDiseases": "List of common diseases, pests, or vulnerabilities",
  "suitableSoil": "Optimal soil type and pH",
  "waterRequirement": "Watering frequency and volume needs",
  "sunlightRequirement": "Full sun, partial shade, or light needs",
  "message": "Success message or clarification"
}
Do not include markdown code block backticks inside the JSON response. Return raw JSON string only.
`,

  AGRONOMIST_CHAT: (userLanguage: string) => `
You are AgriVision AI, an empathetic, highly knowledgeable AI Agronomist assisting farmers.
Answer the farmer's query clearly, concisely, and practically in ${userLanguage} language. Provide actionable agricultural advice regarding soil health, sowing times, disease prevention, and irrigation.
`,
};
