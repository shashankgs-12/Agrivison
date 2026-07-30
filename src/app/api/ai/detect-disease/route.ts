import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image base64 payload is required." },
        { status: 400 }
      );
    }

    // Call Gemini 2.5 API with Disease Detection Prompt
    const rawResponse = await analyzeImageWithGemini(
      image,
      mimeType,
      PROMPTS.DISEASE_DETECTION
    );

    // Clean JSON code fences if present
    const cleanedText = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Disease Detection Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process disease scan.",
        // Fallback response for offline or unconfigured API key testing
        fallbackResult: {
          disease: {
            en: "Yellow Rust (Puccinia striiformis)",
            kn: "ಹಳದಿ ತುಕ್ಕು ರೋಗ",
            hi: "पीला रतुआ (येलो रस्ट)",
            te: "పసుపు తుప్పు తెగులు",
            ta: "மஞ்சள் துரு நோய்",
            ml: "മഞ്ഞ തുരുമ്പ് രോഗം",
          },
          scientificName: "Puccinia striiformis",
          confidence: 94,
          severity: "critical",
          symptoms: {
            en: "Bright yellow streaks of pustules on leaf blades, parallel to veins.",
            kn: "ಎಲೆಯ ಅಂಚುಗಳಿಗೆ ಸಮಾನಾಂತರವಾಗಿ ಹಳದಿ ಪಟ್ಟಿಗಳ ಪ್ರತ್ಯಕ್ಷತೆ.",
            hi: "पत्तियों पर पीली धारियां और फफोले दिखना।",
            te: "ఆకులపై పసుపు చారలు మరియు బుడగలు రావడము.",
            ta: "இலைகளில் மஞ்சள் கோடுகள் காணப்படுதல்.",
            ml: "ഇലകളിൽ മഞ്ഞ വരകളും കുമിളകളും കാണപ്പെടുന്നു.",
          },
          treatment: {
            organic: {
              en: "Spray Neem Seed Kernel Extract (5%) or Trichoderma formulations.",
              kn: "ಬೇೇವಿನ ಎಣ್ಣೆ (5%) ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾ ಲೇಪನ ಉಪಯೋಗಿಸಿ.",
              hi: "नीम के तेल (5%) का छिड़काव करें।",
              te: "వేప నూనె (5%) పిచికారీ చేయండి.",
              ta: "வேப்ப எண்ணெய் (5%) தெளிக்கவும்.",
              ml: "വേപ്പെണ്ണ (5%) തളിക്കുക.",
            },
            chemical: {
              en: "Spray Propiconazole 25% EC @ 1ml/L water.",
              kn: "ಪ್ರೊಪಿಕೊನಜೋಲ್ 25% EC (1ml/L) ಸಿಂಪಡಿಸಿ.",
              hi: "प्रोपीकोनाज़ोल 25% EC 1ml/लीटर पानी में घोलकर छिड़कें।",
              te: "ప్రోపికోనాజోల్ 25% EC ని పిచికారీ చేయండి.",
              ta: "புரோபிகோனசோல் 25% EC தெளிக்கவும்.",
              ml: "പ്രൊപ്പികൊനാസോൾ 25% EC പ്രയോഗിക്കുക.",
            },
          },
        },
      },
      { status: 500 }
    );
  }
}
