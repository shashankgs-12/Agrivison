import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/utils/constants";

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export type NavigationKey =
  | "dashboard"
  | "farms"
  | "crops"
  | "disease"
  | "plant"
  | "weather"
  | "irrigation"
  | "fertilizer"
  | "reports"
  | "settings"
  | "profile";

export interface CropHelpEntry {
  field: string;
  explanation: string;
  example: string;
}

const cropHelp: Record<AppLanguage, CropHelpEntry[]> = {
  en: [
    { field: "Select farm", explanation: "Choose the farm where this crop is planted. This connects the crop to that farm's location and land area.", example: "Choose North Field for the paddy planted there." },
    { field: "Crop name", explanation: "The plant you are growing. It helps organize records and tailor advice.", example: "Paddy, coconut, coffee, or mango." },
    { field: "Variety", explanation: "The local or named type, if known. Varieties can grow and mature at different rates.", example: "Sona Masuri rice or Arabica coffee." },
    { field: "Planting / sowing date", explanation: "The day seed was sown or a seedling was planted. The app uses it to calculate crop age and stage.", example: "Enter the day paddy seedlings were transplanted." },
    { field: "Crop lifecycle", explanation: "Choose a short-season crop harvested once, or a long-lived crop managed for repeated harvests.", example: "Paddy is usually annual; coconut is perennial." },
    { field: "Expected harvest date", explanation: "For annual crops, estimate when this crop should be ready. Choose a date on or after planting.", example: "A short-season crop may be ready about four months after sowing." },
    { field: "Establishment period", explanation: "The early period after planting when a perennial plant develops roots and settles into the field. It may need extra care.", example: "A young orchard may need its first year to establish." },
    { field: "Maturity period", explanation: "Approximate time from planting until a perennial crop begins regular production. The crop remains active after maturity.", example: "Enter the expected months until a coffee plant starts bearing." },
    { field: "First expected harvest", explanation: "Optional estimate for the first perennial harvest. Leave it blank if you do not know the date.", example: "Add the first expected coconut harvest date if known." },
    { field: "Recurring harvest interval", explanation: "How often to expect another harvest after perennial production starts.", example: "12 months creates a yearly harvest reminder." },
    { field: "Irrigation check interval", explanation: "How often to check whether the crop needs water. This is a reminder, not an automatic watering instruction.", example: "7 days means check soil and water needs weekly." },
    { field: "Nutrient review interval", explanation: "How often to review soil nutrients and crop feeding needs. Use local advice and soil conditions before applying fertilizer.", example: "90 days means review about every three months." },
    { field: "Disease monitoring interval", explanation: "How often to inspect plants for disease or pests so symptoms can be noticed early.", example: "7 days means inspect once a week." },
    { field: "Soil care interval", explanation: "How often to review soil condition, ground cover, drainage, and organic matter.", example: "30 days means check soil-care needs monthly." },
    { field: "Pruning review interval", explanation: "For perennial crops, how often to check if pruning is needed. Prune only at a suitable time for the crop.", example: "180 days means review pruning about twice a year." },
    { field: "Growth stage", explanation: "The crop's current development stage. It helps make reminders and recommendations more relevant.", example: "Choose Flowering when the crop is producing flowers." },
    { field: "Area (acres)", explanation: "The part of the selected farm planted with this crop. It must not exceed the farm's total area.", example: "Enter 1.5 for one and a half acres." },
    { field: "Water need", explanation: "A general low, medium, or high water-use category. Actual watering also depends on weather and soil moisture.", example: "Choose High for a crop that usually needs frequent water." },
  ],
  kn: [
    { field: "ಜಮೀನನ್ನು ಆಯ್ಕೆಮಾಡಿ", explanation: "ಈ ಬೆಳೆ ಬೆಳೆದಿರುವ ಜಮೀನನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಇದರಿಂದ ಬೆಳೆಗೆ ಜಮೀನಿನ ಸ್ಥಳ ಮತ್ತು ವಿಸ್ತೀರ್ಣ ಜೋಡಿಸಲಾಗುತ್ತದೆ.", example: "ಭತ್ತ ಬೆಳೆದಿರುವ ಉತ್ತರದ ಹೊಲವನ್ನು ಆಯ್ಕೆಮಾಡಿ." },
    { field: "ಬೆಳೆಯ ಹೆಸರು", explanation: "ನೀವು ಬೆಳೆಸುತ್ತಿರುವ ಸಸ್ಯದ ಹೆಸರು. ದಾಖಲೆ ಮತ್ತು ಸಲಹೆಗಳನ್ನು ಸರಿಯಾಗಿ ಹೊಂದಿಸಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.", example: "ಭತ್ತ, ತೆಂಗು, ಕಾಫಿ ಅಥವಾ ಮಾವು." },
    { field: "ತಳಿ", explanation: "ತಿಳಿದಿದ್ದರೆ ಸ್ಥಳೀಯ ಅಥವಾ ಹೆಸರಿರುವ ತಳಿಯನ್ನು ಬರೆಯಿರಿ. ತಳಿಗಳ ಬೆಳವಣಿಗೆ ಮತ್ತು ಪಕ್ವಗೊಳ್ಳುವ ಸಮಯ ಬದಲಾಗಬಹುದು.", example: "ಸೋನಾ ಮಸೂರಿ ಭತ್ತ ಅಥವಾ ಅರೇಬಿಕಾ ಕಾಫಿ." },
    { field: "ನಾಟಿ / ಬಿತ್ತನೆ ದಿನಾಂಕ", explanation: "ಬೀಜ ಬಿತ್ತಿದ ಅಥವಾ ಸಸಿ ನೆಟ್ಟ ದಿನ. ಇದರಿಂದ ಬೆಳೆಯ ವಯಸ್ಸು ಮತ್ತು ಹಂತವನ್ನು ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತದೆ.", example: "ಭತ್ತದ ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡಿದ ದಿನವನ್ನು ನಮೂದಿಸಿ." },
    { field: "ಬೆಳೆಯ ಅವಧಿ", explanation: "ಒಂದು ಋತುವಿನಲ್ಲಿ ಕೊಯ್ಲಾಗುವ ಅಲ್ಪಾವಧಿ ಬೆಳೆ ಅಥವಾ ಹಲವು ವರ್ಷ ನಿರ್ವಹಿಸುವ ದೀರ್ಘಾವಧಿ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ.", example: "ಭತ್ತ ಸಾಮಾನ್ಯವಾಗಿ ವಾರ್ಷಿಕ; ತೆಂಗು ದೀರ್ಘಾವಧಿ ಬೆಳೆ." },
    { field: "ನಿರೀಕ್ಷಿತ ಕೊಯ್ಲು ದಿನಾಂಕ", explanation: "ವಾರ್ಷಿಕ ಬೆಳೆಗೆ ಕೊಯ್ಲು ಸಿದ್ಧವಾಗುವ ಅಂದಾಜು ದಿನ. ನಾಟಿ ಅಥವಾ ಬಿತ್ತನೆಯ ದಿನದ ನಂತರದ ದಿನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", example: "ಅಲ್ಪಾವಧಿ ಬೆಳೆ ಬಿತ್ತನೆಯ ನಾಲ್ಕು ತಿಂಗಳ ನಂತರ ಸಿದ್ಧವಾಗಬಹುದು." },
    { field: "ಸ್ಥಾಪನೆಯ ಅವಧಿ", explanation: "ದೀರ್ಘಾವಧಿ ಸಸಿ ಬೇರು ಬೆಳೆಸಿ ಹೊಲಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುವ ನೆಟ್ಟ ನಂತರದ ಆರಂಭದ ಅವಧಿ. ಈ ಸಮಯದಲ್ಲಿ ಹೆಚ್ಚು ಆರೈಕೆ ಬೇಕಾಗಬಹುದು.", example: "ಹೊಸ ತೋಟಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳಲು ಮೊದಲ ವರ್ಷ ಬೇಕಾಗಬಹುದು." },
    { field: "ಪಕ್ವಗೊಳ್ಳುವ ಅವಧಿ", explanation: "ನೆಟ್ಟ ದಿನದಿಂದ ದೀರ್ಘಾವಧಿ ಬೆಳೆ ನಿಯಮಿತ ಇಳುವರಿ ನೀಡುವವರೆಗಿನ ಅಂದಾಜು ಸಮಯ. ಪಕ್ವವಾದರೂ ಬೆಳೆ ಸಕ್ರಿಯವಾಗಿಯೇ ಇರುತ್ತದೆ.", example: "ಕಾಫಿ ಗಿಡ ಫಲ ನೀಡಲು ಬೇಕಾಗುವ ತಿಂಗಳುಗಳನ್ನು ನಮೂದಿಸಿ." },
    { field: "ಮೊದಲ ನಿರೀಕ್ಷಿತ ಕೊಯ್ಲು", explanation: "ದೀರ್ಘಾವಧಿ ಬೆಳೆಯ ಮೊದಲ ಕೊಯ್ಲಿನ ಐಚ್ಛಿಕ ಅಂದಾಜು. ದಿನಾಂಕ ತಿಳಿಯದಿದ್ದರೆ ಖಾಲಿ ಬಿಡಿ.", example: "ತಿಳಿದಿದ್ದರೆ ಮೊದಲ ತೆಂಗಿನ ಕೊಯ್ಲಿನ ದಿನ ಸೇರಿಸಿ." },
    { field: "ಮರುಕಳಿಸುವ ಕೊಯ್ಲಿನ ಅಂತರ", explanation: "ಇಳುವರಿ ಆರಂಭವಾದ ನಂತರ ಮುಂದಿನ ಕೊಯ್ಲಿಗೆ ಎಷ್ಟು ಸಮಯ ಬೇಕು ಎಂಬುದು.", example: "12 ತಿಂಗಳು ಎಂದರೆ ವರ್ಷಕ್ಕೊಮ್ಮೆ ಕೊಯ್ಲಿನ ನೆನಪು." },
    { field: "ನೀರಾವರಿ ಪರಿಶೀಲನೆ", explanation: "ಬೆಳೆಗೆ ನೀರು ಬೇಕೇ ಎಂದು ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲಿಸಬೇಕು. ಇದು ನೆನಪು ಮಾತ್ರ; ಸ್ವಯಂಚಾಲಿತ ನೀರು ಹಾಕುವ ಸೂಚನೆ ಅಲ್ಲ.", example: "7 ದಿನ ಎಂದರೆ ವಾರಕ್ಕೊಮ್ಮೆ ಮಣ್ಣು ಮತ್ತು ನೀರಿನ ಅಗತ್ಯ ಪರಿಶೀಲಿಸಿ." },
    { field: "ಪೋಷಕಾಂಶ ಪರಿಶೀಲನೆ", explanation: "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಮತ್ತು ಬೆಳೆಯ ಆಹಾರದ ಅಗತ್ಯವನ್ನು ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲಿಸಬೇಕು. ಗೊಬ್ಬರ ಹಾಕುವ ಮೊದಲು ಸ್ಥಳೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ.", example: "90 ದಿನ ಎಂದರೆ ಸುಮಾರು ಮೂರು ತಿಂಗಳಿಗೆ ಒಮ್ಮೆ ಪರಿಶೀಲನೆ." },
    { field: "ರೋಗ ಪರಿಶೀಲನೆ", explanation: "ರೋಗ ಅಥವಾ ಕೀಟದ ಲಕ್ಷಣಗಳನ್ನು ಬೇಗ ಗಮನಿಸಲು ಗಿಡಗಳನ್ನು ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ನೋಡಬೇಕು.", example: "7 ದಿನ ಎಂದರೆ ವಾರಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲಿಸಿ." },
    { field: "ಮಣ್ಣಿನ ಆರೈಕೆ", explanation: "ಮಣ್ಣಿನ ಸ್ಥಿತಿ, ನೆಲದ ಹೊದಿಕೆ, ನೀರು ಹರಿವು ಮತ್ತು ಸಾವಯವ ಪದಾರ್ಥವನ್ನು ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲಿಸಬೇಕು.", example: "30 ದಿನ ಎಂದರೆ ತಿಂಗಳಿಗೆ ಒಮ್ಮೆ ಮಣ್ಣನ್ನು ಪರಿಶೀಲಿಸಿ." },
    { field: "ಸಮರುವಿಕೆ ಪರಿಶೀಲನೆ", explanation: "ದೀರ್ಘಾವಧಿ ಬೆಳೆಗಳಲ್ಲಿ ಸಮರುವಿಕೆ ಬೇಕೇ ಎಂದು ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲಿಸಬೇಕು. ಸೂಕ್ತ ಋತುವಿನಲ್ಲಿ ಮಾತ್ರ ಸಮರುವಿಕೆ ಮಾಡಿ.", example: "180 ದಿನ ಎಂದರೆ ವರ್ಷಕ್ಕೆ ಸುಮಾರು ಎರಡು ಬಾರಿ ಪರಿಶೀಲಿಸಿ." },
    { field: "ಬೆಳವಣಿಗೆಯ ಹಂತ", explanation: "ಬೆಳೆ ಈಗಿರುವ ಬೆಳವಣಿಗೆಯ ಹಂತ. ಇದರಿಂದ ನೆನಪು ಮತ್ತು ಸಲಹೆ ಹೆಚ್ಚು ಸೂಕ್ತವಾಗುತ್ತವೆ.", example: "ಹೂಗಳು ಬಂದಾಗ ಹೂ ಬಿಡುವ ಹಂತವನ್ನು ಆಯ್ಕೆಮಾಡಿ." },
    { field: "ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)", explanation: "ಆಯ್ಕೆ ಮಾಡಿದ ಜಮೀನಿನಲ್ಲಿ ಈ ಬೆಳೆ ಬೆಳೆದಿರುವ ಭಾಗ. ಇದು ಜಮೀನಿನ ಒಟ್ಟು ವಿಸ್ತೀರ್ಣಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬಾರದು.", example: "ಒಂದೂವರೆ ಎಕರೆಗೆ 1.5 ನಮೂದಿಸಿ." },
    { field: "ನೀರಿನ ಅಗತ್ಯ", explanation: "ಬೆಳೆ ಸಾಮಾನ್ಯವಾಗಿ ಕಡಿಮೆ, ಮಧ್ಯಮ ಅಥವಾ ಹೆಚ್ಚು ನೀರು ಬಳಸುತ್ತದೆಯೇ ಎಂಬ ವರ್ಗ. ನಿಜವಾದ ನೀರಾವರಿ ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ತೇವವನ್ನೂ ಅವಲಂಬಿಸಿದೆ.", example: "ಸಾಮಾನ್ಯವಾಗಿ ಹೆಚ್ಚು ನೀರು ಬೇಕಾದ ಬೆಳೆಗೆ High ಆಯ್ಕೆಮಾಡಿ." },
  ],
  hi: [
    { field: "खेत चुनें", explanation: "वह खेत चुनें जहाँ यह फसल लगी है। इससे फसल खेत के स्थान और क्षेत्रफल से जुड़ती है।", example: "जहाँ धान लगा है, वह उत्तरी खेत चुनें।" },
    { field: "फसल का नाम", explanation: "आप जो पौधा उगा रहे हैं उसका नाम। इससे रिकॉर्ड और सलाह व्यवस्थित रहती है।", example: "धान, नारियल, कॉफी या आम।" },
    { field: "किस्म", explanation: "पता हो तो स्थानीय या नाम वाली किस्म लिखें। अलग किस्में अलग गति से बढ़ती और पकती हैं।", example: "सोना मसूरी धान या अरेबिका कॉफी।" },
    { field: "रोपाई / बुवाई की तारीख", explanation: "बीज बोने या पौधा लगाने का दिन। इससे फसल की उम्र और अवस्था गिनी जाती है।", example: "धान की रोपाई का दिन दर्ज करें।" },
    { field: "फसल का जीवनकाल", explanation: "एक मौसम में कटने वाली फसल या कई वर्षों तक संभाली जाने वाली फसल चुनें।", example: "धान आमतौर पर वार्षिक है; नारियल बहुवर्षीय है।" },
    { field: "अनुमानित कटाई की तारीख", explanation: "वार्षिक फसल के तैयार होने की अनुमानित तारीख चुनें। यह रोपाई या बुवाई के बाद की होनी चाहिए।", example: "कम अवधि वाली फसल बुवाई के लगभग चार महीने बाद तैयार हो सकती है।" },
    { field: "स्थापना अवधि", explanation: "बहुवर्षीय पौधे के जड़ें जमाने और खेत के अनुकूल होने की शुरुआती अवधि। इस समय अधिक देखभाल की जरूरत हो सकती है।", example: "नए बाग को स्थापित होने में पहला साल लग सकता है।" },
    { field: "परिपक्वता अवधि", explanation: "रोपण से नियमित उपज शुरू होने तक का अनुमानित समय। परिपक्व होने के बाद भी फसल सक्रिय रहती है।", example: "कॉफी के फल देने तक के अनुमानित महीने दर्ज करें।" },
    { field: "पहली अनुमानित कटाई", explanation: "बहुवर्षीय फसल की पहली कटाई की वैकल्पिक तारीख। पता न हो तो खाली छोड़ें।", example: "पता हो तो पहले नारियल की कटाई की तारीख लिखें।" },
    { field: "बार-बार कटाई का अंतराल", explanation: "उपज शुरू होने के बाद अगली कटाई कितने समय में अपेक्षित है।", example: "12 महीने का अर्थ है हर साल कटाई की याद दिलाना।" },
    { field: "सिंचाई जांच का अंतराल", explanation: "फसल को पानी चाहिए या नहीं, यह कितने दिन में जांचें। यह याद दिलाता है; अपने आप पानी देने का आदेश नहीं है।", example: "7 दिन का मतलब हर हफ्ते मिट्टी और पानी की जरूरत देखें।" },
    { field: "पोषक तत्व समीक्षा", explanation: "मिट्टी के पोषक तत्व और खाद की जरूरत कितने दिन में जांचें। खाद डालने से पहले स्थानीय सलाह लें।", example: "90 दिन का अर्थ लगभग हर तीन महीने में समीक्षा।" },
    { field: "रोग जांच का अंतराल", explanation: "रोग या कीट के लक्षण जल्दी देखने के लिए पौधों की कितने दिन में जांच करें।", example: "7 दिन का अर्थ सप्ताह में एक बार जांच।" },
    { field: "मिट्टी की देखभाल", explanation: "मिट्टी, जमीन के आवरण, जल निकासी और जैविक पदार्थ की कितने दिन में समीक्षा करें।", example: "30 दिन का अर्थ महीने में एक बार मिट्टी देखें।" },
    { field: "छंटाई समीक्षा", explanation: "बहुवर्षीय फसल में छंटाई की जरूरत कितने दिन में देखें। फसल और मौसम के अनुकूल समय पर ही छंटाई करें।", example: "180 दिन का अर्थ साल में लगभग दो बार समीक्षा।" },
    { field: "विकास अवस्था", explanation: "फसल इस समय किस विकास चरण में है। इससे याद दिलाने और सलाह को बेहतर ढंग से चुना जाता है।", example: "फूल आने पर Flowering चुनें।" },
    { field: "क्षेत्रफल (एकड़)", explanation: "चुने हुए खेत का वह हिस्सा जहाँ यह फसल लगी है। यह खेत के कुल क्षेत्रफल से अधिक नहीं हो सकता।", example: "डेढ़ एकड़ के लिए 1.5 दर्ज करें।" },
    { field: "पानी की जरूरत", explanation: "फसल की सामान्य पानी खपत कम, मध्यम या अधिक है। असली सिंचाई मौसम और मिट्टी की नमी पर भी निर्भर करती है।", example: "जिस फसल को अक्सर पानी चाहिए उसके लिए High चुनें।" },
  ],
  te: [
    { field: "పొలాన్ని ఎంచుకోండి", explanation: "ఈ పంట ఉన్న పొలాన్ని ఎంచుకోండి. దీనివల్ల పంట పొలం స్థానం, విస్తీర్ణంతో కలుస్తుంది.", example: "వరి ఉన్న ఉత్తర పొలాన్ని ఎంచుకోండి." },
    { field: "పంట పేరు", explanation: "మీరు పెంచుతున్న మొక్క పేరు. రికార్డులు, సలహాలను సరిగ్గా ఉంచడానికి ఇది సహాయపడుతుంది.", example: "వరి, కొబ్బరి, కాఫీ లేదా మామిడి." },
    { field: "రకం", explanation: "తెలిస్తే స్థానిక లేదా పేరు గల రకాన్ని నమోదు చేయండి. రకాల పెరుగుదల, పక్వానికి పట్టే సమయం మారవచ్చు.", example: "సోనా మసూరి వరి లేదా అరబికా కాఫీ." },
    { field: "నాటిన / విత్తిన తేదీ", explanation: "విత్తనం వేసిన లేదా మొక్క నాటిన రోజు. దీని ద్వారా పంట వయస్సు, దశ లెక్కించబడతాయి.", example: "వరి నాటిన రోజును నమోదు చేయండి." },
    { field: "పంట జీవనకాలం", explanation: "ఒక సీజన్‌లో కోతకు వచ్చే పంట లేదా ఎన్నో సంవత్సరాలు నిర్వహించే పంటను ఎంచుకోండి.", example: "వరి సాధారణంగా వార్షికం; కొబ్బరి దీర్ఘకాలికం." },
    { field: "అంచనా కోత తేదీ", explanation: "వార్షిక పంట సిద్ధమయ్యే అంచనా తేదీని ఎంచుకోండి. ఇది నాటిన లేదా విత్తిన తేదీ తర్వాత ఉండాలి.", example: "తక్కువకాల పంట విత్తిన నాలుగు నెలలకు సిద్ధమవచ్చు." },
    { field: "స్థాపన కాలం", explanation: "దీర్ఘకాలిక మొక్క వేర్లు పెంచుకుని పొలానికి అలవాటు పడే ప్రారంభ కాలం. ఈ సమయంలో అదనపు సంరక్షణ అవసరం కావచ్చు.", example: "కొత్త తోట స్థిరపడటానికి మొదటి సంవత్సరం పట్టవచ్చు." },
    { field: "పక్వ కాలం", explanation: "నాటినప్పటి నుంచి దీర్ఘకాలిక పంట క్రమమైన దిగుబడి ఇవ్వడం మొదలయ్యే వరకు అంచనా సమయం. పక్వమైన తర్వాత కూడా పంట కొనసాగుతుంది.", example: "కాఫీ మొక్క కాయలు ఇవ్వడానికి పట్టే నెలలను నమోదు చేయండి." },
    { field: "మొదటి అంచనా కోత", explanation: "దీర్ఘకాలిక పంట మొదటి కోతకు ఐచ్ఛిక అంచనా. తేదీ తెలియకపోతే ఖాళీగా వదలండి.", example: "తెలిస్తే మొదటి కొబ్బరి కోత తేదీని ఇవ్వండి." },
    { field: "పునరావృత కోత వ్యవధి", explanation: "దిగుబడి మొదలైన తర్వాత తదుపరి కోతకు ఎంత సమయం పడుతుందో నమోదు చేయండి.", example: "12 నెలలు అంటే ప్రతి సంవత్సరం కోత గుర్తుచేస్తుంది." },
    { field: "నీటిపారుదల తనిఖీ", explanation: "పంటకు నీరు అవసరమా అని ఎన్ని రోజులకు ఒకసారి చూడాలి. ఇది గుర్తు మాత్రమే; ఆటోమేటిక్ నీటి ఆదేశం కాదు.", example: "7 రోజులు అంటే వారానికి ఒకసారి నేల, నీటి అవసరాన్ని చూడండి." },
    { field: "పోషకాల సమీక్ష", explanation: "నేల పోషకాలు, ఎరువు అవసరాన్ని ఎన్ని రోజులకు ఒకసారి సమీక్షించాలి. ఎరువు వేయడానికి ముందు స్థానిక సలహా తీసుకోండి.", example: "90 రోజులు అంటే సుమారు మూడు నెలలకు ఒకసారి." },
    { field: "వ్యాధి పర్యవేక్షణ", explanation: "వ్యాధి లేదా పురుగుల లక్షణాలను ముందుగా గుర్తించడానికి మొక్కలను ఎన్ని రోజులకు ఒకసారి చూడాలి.", example: "7 రోజులు అంటే వారానికి ఒకసారి పరిశీలించండి." },
    { field: "నేల సంరక్షణ", explanation: "నేల పరిస్థితి, నేల కవచం, నీటి పారుదల, సేంద్రియ పదార్థాన్ని ఎన్ని రోజులకు ఒకసారి చూడాలి.", example: "30 రోజులు అంటే నెలకు ఒకసారి నేలను పరిశీలించండి." },
    { field: "కత్తిరింపు సమీక్ష", explanation: "దీర్ఘకాలిక పంటకు కత్తిరింపు అవసరమా అని ఎన్ని రోజులకు ఒకసారి చూడాలి. సరైన పంట కాలంలోనే కత్తిరించండి.", example: "180 రోజులు అంటే సంవత్సరానికి దాదాపు రెండుసార్లు సమీక్ష." },
    { field: "పెరుగుదల దశ", explanation: "పంట ప్రస్తుతం ఉన్న పెరుగుదల దశ. దీనివల్ల గుర్తుచూపులు, సలహాలు మరింత సరిపోతాయి.", example: "పూలు వస్తున్నప్పుడు Flowering ఎంచుకోండి." },
    { field: "విస్తీర్ణం (ఎకరాలు)", explanation: "ఎంచుకున్న పొలంలో ఈ పంటకు ఉపయోగించిన భాగం. ఇది మొత్తం పొలం విస్తీర్ణం కంటే ఎక్కువ కాకూడదు.", example: "ఒకటిన్నర ఎకరానికి 1.5 నమోదు చేయండి." },
    { field: "నీటి అవసరం", explanation: "పంటకు సాధారణంగా తక్కువ, మధ్యస్థ లేదా ఎక్కువ నీరు అవసరమా అనే వర్గం. నిజమైన నీటిపారుదల వాతావరణం, నేల తేమపై కూడా ఆధారపడుతుంది.", example: "తరచూ నీరు అవసరమయ్యే పంటకు High ఎంచుకోండి." },
  ],
  ta: [
    { field: "பண்ணையைத் தேர்ந்தெடுக்கவும்", explanation: "இந்தப் பயிர் உள்ள பண்ணையைத் தேர்ந்தெடுக்கவும். இதனால் பயிர் அந்த இடம் மற்றும் நிலப்பரப்புடன் இணைக்கப்படும்.", example: "நெல் உள்ள வடக்குப் பண்ணையைத் தேர்ந்தெடுக்கவும்." },
    { field: "பயிரின் பெயர்", explanation: "நீங்கள் வளர்க்கும் செடியின் பெயர். பதிவுகளையும் ஆலோசனையையும் சரியாக அமைக்க உதவும்.", example: "நெல், தென்னை, காபி அல்லது மாம்பழம்." },
    { field: "வகை", explanation: "தெரிந்தால் உள்ளூர் அல்லது பெயரிடப்பட்ட வகையைப் பதிவு செய்யவும். வகைகளின் வளர்ச்சி, முதிர்வு காலம் மாறலாம்.", example: "சோனா மசூரி நெல் அல்லது அரபிக்கா காபி." },
    { field: "நடவு / விதைத்த தேதி", explanation: "விதை விதைத்த அல்லது நாற்று நட்ட நாள். இதிலிருந்து பயிரின் வயதும் வளர்ச்சி நிலையும் கணக்கிடப்படும்.", example: "நெல் நாற்று நட்ட நாளைப் பதிவு செய்யவும்." },
    { field: "பயிர் வாழ்நாள்", explanation: "ஒரு பருவத்தில் அறுவடை செய்யும் பயிரா அல்லது பல ஆண்டுகள் பராமரிக்கும் பயிரா என்பதைத் தேர்ந்தெடுக்கவும்.", example: "நெல் பொதுவாக ஓராண்டுப் பயிர்; தென்னை பல்லாண்டுப் பயிர்." },
    { field: "எதிர்பார்க்கும் அறுவடை நாள்", explanation: "ஓராண்டுப் பயிர் தயாராகும் என எதிர்பார்க்கும் நாளைத் தேர்ந்தெடுக்கவும். அது நடவு அல்லது விதைத்த நாளுக்குப் பிறகு இருக்க வேண்டும்.", example: "குறுகிய காலப் பயிர் விதைத்த நான்கு மாதங்களில் தயாராகலாம்." },
    { field: "நிறுவும் காலம்", explanation: "பல்லாண்டுச் செடி வேரூன்றி வயலுக்கு ஏற்றுக்கொள்ளும் நடவுக்குப் பிந்தைய ஆரம்ப காலம். கூடுதல் பராமரிப்பு தேவைப்படலாம்.", example: "புதிய தோட்டம் நிலைபெற முதல் ஆண்டு தேவைப்படலாம்." },
    { field: "முதிர்ச்சி காலம்", explanation: "நட்டதிலிருந்து பல்லாண்டுப் பயிர் வழக்கமான விளைச்சல் தரத் தொடங்கும் வரை உள்ள கணிக்கப்பட்ட காலம். முதிர்ந்த பிறகும் பயிர் தொடரும்.", example: "காபி காய் தரத் தொடங்கும் வரை உள்ள மாதங்களைப் பதிவு செய்யவும்." },
    { field: "முதல் எதிர்பார்க்கும் அறுவடை", explanation: "பல்லாண்டுப் பயிரின் முதல் அறுவடைக்கான விருப்பத் தேதி. தெரியாவிட்டால் காலியாக விடவும்.", example: "தெரிந்தால் முதல் தென்னை அறுவடை நாளைச் சேர்க்கவும்." },
    { field: "மீண்டும் அறுவடை இடைவெளி", explanation: "விளைச்சல் தொடங்கிய பின் அடுத்த அறுவடை எவ்வளவு காலத்தில் வரும் என்பதைப் பதிவு செய்யவும்.", example: "12 மாதங்கள் என்றால் ஆண்டுதோறும் அறுவடை நினைவூட்டல்." },
    { field: "நீர்ப்பாசனச் சரிபார்ப்பு", explanation: "பயிருக்கு நீர் தேவையா என்று எத்தனை நாட்களுக்கு ஒருமுறை பார்க்க வேண்டும். இது நினைவூட்டல் மட்டுமே; தானியங்கி நீர்ப்பாசன உத்தரவு அல்ல.", example: "7 நாட்கள் என்றால் வாரந்தோறும் மண்ணையும் நீர் தேவையையும் பார்க்கவும்." },
    { field: "ஊட்டச்சத்து மதிப்பாய்வு", explanation: "மண் ஊட்டச்சத்து, உரத் தேவையை எத்தனை நாட்களுக்கு ஒருமுறை மதிப்பாய்வு செய்ய வேண்டும். உரமிட உள்ளூர் ஆலோசனையைப் பெறவும்.", example: "90 நாட்கள் என்றால் சுமார் மூன்று மாதங்களுக்கு ஒருமுறை." },
    { field: "நோய் கண்காணிப்பு", explanation: "நோய் அல்லது பூச்சி அறிகுறிகளை முன்கூட்டியே காண எத்தனை நாட்களுக்கு ஒருமுறை செடிகளைப் பார்க்க வேண்டும்.", example: "7 நாட்கள் என்றால் வாரம் ஒருமுறை ஆய்வு செய்யவும்." },
    { field: "மண் பராமரிப்பு", explanation: "மண் நிலை, நிலமூடி, வடிகால், கரிமப் பொருள் ஆகியவற்றை எத்தனை நாட்களுக்கு ஒருமுறை பார்க்க வேண்டும்.", example: "30 நாட்கள் என்றால் மாதம் ஒருமுறை மண்ணைப் பார்க்கவும்." },
    { field: "கவாத்து மதிப்பாய்வு", explanation: "பல்லாண்டுப் பயிரில் கவாத்து தேவையா என்று எத்தனை நாட்களுக்கு ஒருமுறை பார்க்க வேண்டும். பயிருக்கும் பருவத்துக்கும் ஏற்றபோது மட்டும் கவாத்து செய்யவும்.", example: "180 நாட்கள் என்றால் ஆண்டுக்கு சுமார் இருமுறை மதிப்பாய்வு." },
    { field: "வளர்ச்சி நிலை", explanation: "பயிர் இப்போது இருக்கும் வளர்ச்சி நிலை. இதனால் நினைவூட்டலும் ஆலோசனையும் பொருத்தமாகும்.", example: "பூக்கும் போது Flowering என்பதைத் தேர்ந்தெடுக்கவும்." },
    { field: "பரப்பளவு (ஏக்கர்)", explanation: "தேர்ந்தெடுத்த பண்ணையில் இந்தப் பயிர் உள்ள பகுதி. இது பண்ணையின் மொத்த பரப்பளவை விட அதிகமாக இருக்கக்கூடாது.", example: "ஒன்றரை ஏக்கருக்கு 1.5 என உள்ளிடவும்." },
    { field: "நீர் தேவை", explanation: "பயிருக்கு பொதுவாக குறைந்த, நடுத்தர அல்லது அதிக நீர் தேவைப்படுமா என்ற வகை. உண்மையான நீர்ப்பாசனம் வானிலை, மண் ஈரத்தையும் சாரும்.", example: "அடிக்கடி நீர் தேவைப்படும் பயிருக்கு High என்பதைத் தேர்ந்தெடுக்கவும்." },
  ],
  ml: [
    { field: "ഫാം തിരഞ്ഞെടുക്കുക", explanation: "ഈ വിള വളരുന്ന ഫാം തിരഞ്ഞെടുക്കുക. ഇതിലൂടെ വിള ഫാമിന്റെ സ്ഥലവും വിസ്തീർണ്ണവുമായി ബന്ധിപ്പിക്കും.", example: "നെല്ല് നട്ടിരിക്കുന്ന വടക്കൻ പാടം തിരഞ്ഞെടുക്കുക." },
    { field: "വിളയുടെ പേര്", explanation: "നിങ്ങൾ വളർത്തുന്ന ചെടിയുടെ പേര്. രേഖകളും നിർദേശങ്ങളും ക്രമീകരിക്കാൻ ഇത് സഹായിക്കുന്നു.", example: "നെല്ല്, തെങ്ങ്, കാപ്പി, മാവ്." },
    { field: "ഇനം", explanation: "അറിയാമെങ്കിൽ നാട്ടിലെ അല്ലെങ്കിൽ പേരുള്ള ഇനം രേഖപ്പെടുത്തുക. ഇനങ്ങൾ വളരുന്നതും പാകമാകുന്നതും വ്യത്യസ്ത വേഗത്തിലാണ്.", example: "സോണ മസൂരി നെല്ല് അല്ലെങ്കിൽ അറബിക്ക കാപ്പി." },
    { field: "നടീൽ / വിത്തിടൽ തീയതി", explanation: "വിത്തിട്ടതോ തൈ നട്ടതോ ആയ ദിവസം. ഇതിൽ നിന്ന് വിളയുടെ പ്രായവും വളർച്ചാഘട്ടവും കണക്കാക്കും.", example: "നെൽത്തൈ നട്ട ദിവസം രേഖപ്പെടുത്തുക." },
    { field: "വിളയുടെ ജീവിതചക്രം", explanation: "ഒരു സീസണിൽ വിളവെടുക്കുന്ന വിളയോ വർഷങ്ങളോളം പരിപാലിക്കുന്ന വിളയോ തിരഞ്ഞെടുക്കുക.", example: "നെല്ല് സാധാരണ വാർഷിക വിളയാണ്; തെങ്ങ് ദീർഘകാല വിളയാണ്." },
    { field: "പ്രതീക്ഷിക്കുന്ന വിളവെടുപ്പ് തീയതി", explanation: "വാർഷിക വിള തയ്യാറാകുമെന്നുള്ള ഏകദേശ തീയതി തിരഞ്ഞെടുക്കുക. നടീൽ അല്ലെങ്കിൽ വിത്തിടൽ തീയതിക്ക് ശേഷമായിരിക്കണം.", example: "ചെറിയ കാലയളവിലെ വിള വിതച്ച് ഏകദേശം നാല് മാസം കഴിഞ്ഞ് തയ്യാറാകാം." },
    { field: "സ്ഥാപന കാലയളവ്", explanation: "ദീർഘകാല ചെടി വേരുറപ്പിച്ച് പാടവുമായി പൊരുത്തപ്പെടുന്ന നടീലിന് ശേഷമുള്ള ആദ്യകാലം. അധിക പരിചരണം ആവശ്യമായേക്കാം.", example: "പുതിയ തോട്ടം ഉറപ്പിക്കാൻ ആദ്യ വർഷം വേണ്ടിവരും." },
    { field: "പാകമാകുന്ന കാലയളവ്", explanation: "നട്ടതുമുതൽ ദീർഘകാല വിള പതിവായി ഉൽപ്പാദിപ്പിക്കാൻ തുടങ്ങുന്നതുവരെയുള്ള ഏകദേശ സമയം. പാകമായാലും വിള സജീവമായി തുടരും.", example: "കാപ്പിച്ചെടി കായ്ക്കാൻ തുടങ്ങുന്ന മാസങ്ങൾ രേഖപ്പെടുത്തുക." },
    { field: "ആദ്യ പ്രതീക്ഷിക്കുന്ന വിളവെടുപ്പ്", explanation: "ദീർഘകാല വിളയുടെ ആദ്യ വിളവെടുപ്പിനുള്ള ഐച്ഛിക തീയതി. അറിയില്ലെങ്കിൽ ഒഴിച്ചിടാം.", example: "അറിയാമെങ്കിൽ ആദ്യത്തെ തേങ്ങ വിളവെടുപ്പ് തീയതി ചേർക്കുക." },
    { field: "ആവർത്തിച്ചുള്ള വിളവെടുപ്പ് ഇടവേള", explanation: "ഉൽപ്പാദനം തുടങ്ങിയ ശേഷം അടുത്ത വിളവെടുപ്പ് എത്ര ഇടവേളയിൽ വരുമെന്ന് രേഖപ്പെടുത്തുക.", example: "12 മാസം എന്നത് വർഷത്തിലൊരിക്കൽ വിളവെടുപ്പ് ഓർമ്മിപ്പിക്കും." },
    { field: "ജലസേചന പരിശോധന ഇടവേള", explanation: "വിളയ്ക്ക് വെള്ളം വേണമോയെന്ന് എത്ര ദിവസത്തിലൊരിക്കൽ പരിശോധിക്കണം. ഇത് ഓർമ്മപ്പെടുത്തൽ മാത്രം; സ്വയം വെള്ളമൊഴിക്കില്ല.", example: "7 ദിവസം എന്നാൽ ആഴ്ചതോറും മണ്ണും വെള്ളത്തിന്റെ ആവശ്യവും പരിശോധിക്കുക." },
    { field: "പോഷക പരിശോധന ഇടവേള", explanation: "മണ്ണിലെ പോഷകങ്ങളും വളത്തിന്റെ ആവശ്യവും എത്ര ദിവസത്തിലൊരിക്കൽ പരിശോധിക്കണം. വളം നൽകും മുമ്പ് പ്രാദേശിക ഉപദേശം തേടുക.", example: "90 ദിവസം എന്നാൽ ഏകദേശം മൂന്ന് മാസത്തിലൊരിക്കൽ." },
    { field: "രോഗ നിരീക്ഷണ ഇടവേള", explanation: "രോഗമോ കീടമോ നേരത്തേ കണ്ടെത്താൻ ചെടികൾ എത്ര ദിവസത്തിലൊരിക്കൽ പരിശോധിക്കണം.", example: "7 ദിവസം എന്നാൽ ആഴ്ചയിലൊരിക്കൽ പരിശോധിക്കുക." },
    { field: "മണ്ണ് പരിപാലന ഇടവേള", explanation: "മണ്ണിന്റെ അവസ്ഥ, നിലമൂടി, നീർവാർച്ച, ജൈവവസ്തുക്കൾ എന്നിവ എത്ര ദിവസത്തിലൊരിക്കൽ പരിശോധിക്കണം.", example: "30 ദിവസം എന്നാൽ മാസത്തിലൊരിക്കൽ മണ്ണ് പരിശോധിക്കുക." },
    { field: "കൊമ്പ് മുറിക്കൽ പരിശോധന", explanation: "ദീർഘകാല വിളയിൽ കൊമ്പ് മുറിക്കൽ ആവശ്യമാണോ എന്ന് എത്ര ദിവസത്തിലൊരിക്കൽ പരിശോധിക്കണം. അനുയോജ്യമായ കാലത്ത് മാത്രം ചെയ്യുക.", example: "180 ദിവസം എന്നാൽ വർഷത്തിൽ ഏകദേശം രണ്ടുതവണ പരിശോധിക്കുക." },
    { field: "വളർച്ചാഘട്ടം", explanation: "വിള ഇപ്പോൾ ഏത് വളർച്ചാഘട്ടത്തിലാണ്. ഇതനുസരിച്ച് ഓർമ്മപ്പെടുത്തലുകളും നിർദേശങ്ങളും നൽകാം.", example: "പൂക്കൾ വരുന്ന സമയത്ത് Flowering തിരഞ്ഞെടുക്കുക." },
    { field: "വിസ്തീർണ്ണം (ഏക്കർ)", explanation: "തിരഞ്ഞെടുത്ത ഫാമിൽ ഈ വിളയ്ക്കായി ഉപയോഗിച്ച ഭാഗം. ഇത് ഫാമിന്റെ ആകെ വിസ്തീർണ്ണത്തെക്കാൾ കൂടുതലാകരുത്.", example: "ഒന്നര ഏക്കറിന് 1.5 നൽകുക." },
    { field: "ജലാവശ്യം", explanation: "വിളയ്ക്ക് പൊതുവെ കുറഞ്ഞ, മിതമായ അല്ലെങ്കിൽ കൂടുതലായ വെള്ളമാണോ വേണ്ടത്. യഥാർത്ഥ ജലസേചനം കാലാവസ്ഥയും മണ്ണിലെ ഈർപ്പവും ആശ്രയിക്കുന്നു.", example: "പതിവായി വെള്ളം വേണ്ട വിളയ്ക്ക് High തിരഞ്ഞെടുക്കുക." },
  ],
};

const text = {
  en: {
    nav: { dashboard: "Dashboard", farms: "My Farms", crops: "Crops", disease: "Disease Scanner", plant: "Plant ID", weather: "Weather", irrigation: "Irrigation Advisor", fertilizer: "Fertilizer Advisor", reports: "Reports", settings: "Settings", profile: "My Profile", home: "Home", scan: "Scan", irrigate: "Irrigate" },
    header: { search: "Search farms, crops...", language: "Dashboard language" },
    help: { title: "Crop form guide", subtitle: "What each field means and why it helps", example: "Example", close: "Close crop form guide", button: "Crop help", saved: "registered successfully." },
    advisor: { irrigation: "AI Irrigation Advisor", fertilizer: "AI Fertilizer Advisor", description: "AI guidance uses your selected crop, its current life stage, farm location, live weather, and linked disease scans.", chooseCrop: "Choose crop", refreshWeather: "Refresh weather", notRecorded: "Not recorded", waterSource: "Water source", soil: "Soil", liveWeatherPending: "Live weather has not been confirmed for this farm yet.", diseaseContext: "Disease scan context", noDisease: "No disease scan is linked to", safetyIntro: "AI guidance is a decision aid. Check the field and soil before applying water or nutrients.", generate: "Generate AI recommendation", loading: "Analyzing farm data…", loadingDetail: "Checking farm weather and asking the AI advisor to use your crop records…", retry: "Try again", inputError: "The selected crop or farm information needs attention. Check its planting date, water need, and farm link, then try again.", recommendation: "AI recommendation", why: "Why", when: "When", amount: "Amount and frequency", timing: "Timing", application: "Application considerations", disease: "Disease context", missing: "Information not available for this recommendation", safety: "Safety", verify: "AI guidance can be wrong. Verify soil and crop conditions before applying water or nutrients.", addFarm: "Add a farm to continue", registerCrop: "Register a crop to continue", addFarmDetail: "Farm location and soil details help make advice specific to your land.", registerCropDetail: "Select a crop linked to one of your farms to get crop-stage-specific guidance.", openFertilizer: "Open Fertilizer Advisor →", openIrrigation: "Open Irrigation Advisor →", registeredCrops: "Registered crops", noFarmLink: "A crop is not linked to an available farm. Check its farm assignment in Crop Management.", tryAgainNetwork: "The AI advisor is temporarily unavailable. Check your connection and try again." },
  },
  kn: {
    nav: { dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", farms: "ನನ್ನ ಜಮೀನುಗಳು", crops: "ಬೆಳೆಗಳು", disease: "ರೋಗ ಪರಿಶೀಲನೆ", plant: "ಸಸ್ಯ ಗುರುತು", weather: "ಹವಾಮಾನ", irrigation: "ನೀರಾವರಿ ಸಲಹೆ", fertilizer: "ಗೊಬ್ಬರ ಸಲಹೆ", reports: "ವರದಿಗಳು", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", profile: "ನನ್ನ ಪ್ರೊಫೈಲ್", home: "ಮುಖಪುಟ", scan: "ಸ್ಕ್ಯಾನ್", irrigate: "ನೀರಾವರಿ" },
    header: { search: "ಜಮೀನು, ಬೆಳೆ ಹುಡುಕಿ...", language: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಭಾಷೆ" },
    help: { title: "ಬೆಳೆ ಫಾರ್ಮ್ ಮಾರ್ಗದರ್ಶಿ", subtitle: "ಪ್ರತಿ ಆಯ್ಕೆಯ ಅರ್ಥ ಮತ್ತು ಉಪಯೋಗ", example: "ಉದಾಹರಣೆ", close: "ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ ಮುಚ್ಚಿ", button: "ಬೆಳೆ ಸಹಾಯ", saved: "ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ." },
    advisor: { irrigation: "AI ನೀರಾವರಿ ಸಲಹೆಗಾರ", fertilizer: "AI ಗೊಬ್ಬರ ಸಲಹೆಗಾರ", description: "ನಿಮ್ಮ ಆಯ್ದ ಬೆಳೆ, ಅದರ ಬೆಳವಣಿಗೆ ಹಂತ, ಜಮೀನಿನ ಸ್ಥಳ, ನೈಜ ಹವಾಮಾನ ಮತ್ತು ಜೋಡಿಸಿದ ರೋಗ ಸ್ಕ್ಯಾನ್‌ಗಳನ್ನು ಬಳಸಿ AI ಸಲಹೆ ನೀಡುತ್ತದೆ.", chooseCrop: "ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ", refreshWeather: "ಹವಾಮಾನ ನವೀಕರಿಸಿ", notRecorded: "ದಾಖಲಾಗಿಲ್ಲ", waterSource: "ನೀರಿನ ಮೂಲ", soil: "ಮಣ್ಣು", liveWeatherPending: "ಈ ಜಮೀನಿನ ನೈಜ ಹವಾಮಾನ ಇನ್ನೂ ದೃಢಪಟ್ಟಿಲ್ಲ.", diseaseContext: "ರೋಗ ಸ್ಕ್ಯಾನ್ ಮಾಹಿತಿ", noDisease: "ಈ ಬೆಳೆಗೆ ಯಾವುದೇ ರೋಗ ಸ್ಕ್ಯಾನ್ ಜೋಡಿಸಿಲ್ಲ:", safetyIntro: "AI ಸಲಹೆ ನಿರ್ಧಾರಕ್ಕೆ ನೆರವು ಮಾತ್ರ. ನೀರು ಅಥವಾ ಪೋಷಕಾಂಶ ನೀಡುವ ಮೊದಲು ಹೊಲ ಮತ್ತು ಮಣ್ಣನ್ನು ಪರಿಶೀಲಿಸಿ.", generate: "AI ಶಿಫಾರಸು ಪಡೆಯಿರಿ", loading: "ಜಮೀನಿನ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", loadingDetail: "ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ, ನಿಮ್ಮ ಬೆಳೆ ದಾಖಲೆಯೊಂದಿಗೆ ಸಲಹೆ ಕೇಳಲಾಗುತ್ತಿದೆ…", retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", inputError: "ಆಯ್ದ ಬೆಳೆ ಅಥವಾ ಜಮೀನಿನ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ. ನಾಟಿ ದಿನಾಂಕ, ನೀರಿನ ಅಗತ್ಯ ಮತ್ತು ಜಮೀನಿನ ಜೋಡಣೆಯನ್ನು ನೋಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", recommendation: "AI ಶಿಫಾರಸು", why: "ಕಾರಣ", when: "ಯಾವಾಗ", amount: "ಪ್ರಮಾಣ ಮತ್ತು ಅವಧಿ", timing: "ಸಮಯ", application: "ಅನ್ವಯಿಸುವಾಗ ಗಮನಿಸಿ", disease: "ರೋಗದ ಮಾಹಿತಿ", missing: "ಈ ಶಿಫಾರಸಿಗೆ ಲಭ್ಯವಿಲ್ಲದ ಮಾಹಿತಿ", safety: "ಸುರಕ್ಷತೆ", verify: "AI ಸಲಹೆ ತಪ್ಪಾಗಿರಬಹುದು. ನೀರು ಅಥವಾ ಪೋಷಕಾಂಶ ನೀಡುವ ಮೊದಲು ಮಣ್ಣು ಮತ್ತು ಬೆಳೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.", addFarm: "ಮುಂದುವರಿಯಲು ಜಮೀನು ಸೇರಿಸಿ", registerCrop: "ಮುಂದುವರಿಯಲು ಬೆಳೆ ನೋಂದಾಯಿಸಿ", addFarmDetail: "ಜಮೀನಿನ ಸ್ಥಳ ಮತ್ತು ಮಣ್ಣಿನ ವಿವರಗಳು ಸೂಕ್ತ ಸಲಹೆಗೆ ನೆರವಾಗುತ್ತವೆ.", registerCropDetail: "ಬೆಳೆ ಹಂತಕ್ಕೆ ತಕ್ಕ ಸಲಹೆಗಾಗಿ ಜಮೀನಿಗೆ ಜೋಡಿಸಿದ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.", openFertilizer: "ಗೊಬ್ಬರ ಸಲಹೆ ತೆರೆಯಿರಿ →", openIrrigation: "ನೀರಾವರಿ ಸಲಹೆ ತೆರೆಯಿರಿ →", registeredCrops: "ನೋಂದಾಯಿಸಿದ ಬೆಳೆಗಳು", noFarmLink: "ಈ ಬೆಳೆ ಲಭ್ಯವಿರುವ ಜಮೀನಿಗೆ ಜೋಡಿಸಿಲ್ಲ. ಬೆಳೆ ನಿರ್ವಹಣೆಯಲ್ಲಿ ಜಮೀನಿನ ಆಯ್ಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.", tryAgainNetwork: "AI ಸಲಹೆ ಈಗ ಲಭ್ಯವಿಲ್ಲ. ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." },
  },
  hi: {
    nav: { dashboard: "डैशबोर्ड", farms: "मेरे खेत", crops: "फसलें", disease: "रोग स्कैनर", plant: "पौधे की पहचान", weather: "मौसम", irrigation: "सिंचाई सलाह", fertilizer: "खाद सलाह", reports: "रिपोर्ट", settings: "सेटिंग्स", profile: "मेरी प्रोफ़ाइल", home: "होम", scan: "स्कैन", irrigate: "सिंचाई" },
    header: { search: "खेत, फसल खोजें...", language: "डैशबोर्ड की भाषा" },
    help: { title: "फसल फ़ॉर्म मार्गदर्शिका", subtitle: "हर विकल्प का अर्थ और उपयोग", example: "उदाहरण", close: "फसल मार्गदर्शिका बंद करें", button: "फसल सहायता", saved: "सफलतापूर्वक दर्ज की गई।" },
    advisor: { irrigation: "AI सिंचाई सलाहकार", fertilizer: "AI खाद सलाहकार", description: "AI सलाह चुनी हुई फसल, उसकी अवस्था, खेत का स्थान, ताज़ा मौसम और जुड़े रोग स्कैन पर आधारित है।", chooseCrop: "फसल चुनें", refreshWeather: "मौसम ताज़ा करें", notRecorded: "दर्ज नहीं", waterSource: "पानी का स्रोत", soil: "मिट्टी", liveWeatherPending: "इस खेत का ताज़ा मौसम अभी सत्यापित नहीं हुआ है।", diseaseContext: "रोग स्कैन जानकारी", noDisease: "इस फसल से कोई रोग स्कैन जुड़ा नहीं है:", safetyIntro: "AI सलाह निर्णय में मदद के लिए है। पानी या पोषक तत्व देने से पहले खेत और मिट्टी जांचें।", generate: "AI सुझाव लें", loading: "खेत की जानकारी जांच रहे हैं…", loadingDetail: "मौसम जांचकर आपकी फसल के रिकॉर्ड के साथ सलाह मांगी जा रही है…", retry: "फिर कोशिश करें", inputError: "चुनी हुई फसल या खेत की जानकारी जांचें। रोपाई की तारीख, पानी की जरूरत और खेत का संबंध देखकर फिर कोशिश करें।", recommendation: "AI सुझाव", why: "क्यों", when: "कब", amount: "मात्रा और अंतराल", timing: "समय", application: "लगाने की सावधानियां", disease: "रोग की जानकारी", missing: "इस सुझाव के लिए उपलब्ध नहीं जानकारी", safety: "सुरक्षा", verify: "AI सलाह गलत हो सकती है। पानी या पोषक तत्व देने से पहले मिट्टी और फसल जांचें।", addFarm: "जारी रखने के लिए खेत जोड़ें", registerCrop: "जारी रखने के लिए फसल दर्ज करें", addFarmDetail: "खेत का स्थान और मिट्टी की जानकारी सलाह को आपकी जमीन के अनुरूप बनाती है।", registerCropDetail: "फसल की अवस्था के अनुसार सलाह पाने के लिए खेत से जुड़ी फसल चुनें।", openFertilizer: "खाद सलाह खोलें →", openIrrigation: "सिंचाई सलाह खोलें →", registeredCrops: "दर्ज फसलें", noFarmLink: "यह फसल किसी उपलब्ध खेत से नहीं जुड़ी है। Crop Management में खेत का चयन जांचें।", tryAgainNetwork: "AI सलाह अभी उपलब्ध नहीं है। कनेक्शन जांचकर फिर कोशिश करें।" },
  },
  te: {
    nav: { dashboard: "డాష్‌బోర్డ్", farms: "నా పొలాలు", crops: "పంటలు", disease: "వ్యాధి స్కానర్", plant: "మొక్క గుర్తింపు", weather: "వాతావరణం", irrigation: "సాగునీటి సలహా", fertilizer: "ఎరువు సలహా", reports: "నివేదికలు", settings: "సెట్టింగ్‌లు", profile: "నా ప్రొఫైల్", home: "హోమ్", scan: "స్కాన్", irrigate: "సాగునీరు" },
    header: { search: "పొలాలు, పంటలు వెతకండి...", language: "డాష్‌బోర్డ్ భాష" },
    help: { title: "పంట ఫారమ్ మార్గదర్శి", subtitle: "ప్రతి ఎంపిక అర్థం, ఉపయోగం", example: "ఉదాహరణ", close: "పంట మార్గదర్శిని మూసివేయండి", button: "పంట సహాయం", saved: "విజయవంతంగా నమోదు చేయబడింది." },
    advisor: { irrigation: "AI సాగునీటి సలహాదారు", fertilizer: "AI ఎరువు సలహాదారు", description: "మీరు ఎంచుకున్న పంట, దాని ప్రస్తుత దశ, పొలం స్థానం, ప్రత్యక్ష వాతావరణం, జతచేసిన వ్యాధి స్కాన్‌లను AI ఉపయోగిస్తుంది.", chooseCrop: "పంటను ఎంచుకోండి", refreshWeather: "వాతావరణాన్ని నవీకరించండి", notRecorded: "నమోదు కాలేదు", waterSource: "నీటి వనరు", soil: "నేల", liveWeatherPending: "ఈ పొలానికి ప్రత్యక్ష వాతావరణం ఇంకా నిర్ధారించబడలేదు.", diseaseContext: "వ్యాధి స్కాన్ సమాచారం", noDisease: "ఈ పంటకు వ్యాధి స్కాన్ జత కాలేదు:", safetyIntro: "AI సలహా నిర్ణయానికి సహాయం మాత్రమే. నీరు లేదా పోషకాలు ఇచ్చే ముందు పొలం, నేలను పరిశీలించండి.", generate: "AI సిఫార్సు పొందండి", loading: "పొలం వివరాలు పరిశీలిస్తున్నాం…", loadingDetail: "వాతావరణాన్ని చూసి మీ పంట రికార్డులతో AI సలహా అడుగుతున్నాం…", retry: "మళ్లీ ప్రయత్నించండి", inputError: "ఎంచుకున్న పంట లేదా పొలం వివరాలను తనిఖీ చేయండి. నాటిన తేదీ, నీటి అవసరం, పొలం అనుసంధానాన్ని చూసి మళ్లీ ప్రయత్నించండి.", recommendation: "AI సిఫార్సు", why: "ఎందుకు", when: "ఎప్పుడు", amount: "మోతాదు, వ్యవధి", timing: "సమయం", application: "వాడేటప్పుడు జాగ్రత్తలు", disease: "వ్యాధి సమాచారం", missing: "ఈ సిఫార్సుకు అందుబాటులో లేని సమాచారం", safety: "భద్రత", verify: "AI సలహా తప్పు కావచ్చు. నీరు లేదా పోషకాలు ఇచ్చే ముందు నేల, పంటను పరిశీలించండి.", addFarm: "కొనసాగించడానికి పొలాన్ని జోడించండి", registerCrop: "కొనసాగించడానికి పంటను నమోదు చేయండి", addFarmDetail: "పొలం స్థానం, నేల వివరాలు మీ భూమికి తగిన సలహాకు సహాయపడతాయి.", registerCropDetail: "పంట దశకు సరిపోయే సలహా కోసం పొలానికి జతచేసిన పంటను ఎంచుకోండి.", openFertilizer: "ఎరువు సలహా తెరవండి →", openIrrigation: "సాగునీటి సలహా తెరవండి →", registeredCrops: "నమోదైన పంటలు", noFarmLink: "ఈ పంట అందుబాటులో ఉన్న పొలానికి జత కాలేదు. Crop Managementలో పొలం అనుసంధానాన్ని తనిఖీ చేయండి.", tryAgainNetwork: "AI సలహా తాత్కాలికంగా అందుబాటులో లేదు. కనెక్షన్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి." },
  },
  ta: {
    nav: { dashboard: "டாஷ்போர்டு", farms: "என் பண்ணைகள்", crops: "பயிர்கள்", disease: "நோய் ஸ்கேனர்", plant: "தாவர அடையாளம்", weather: "வானிலை", irrigation: "நீர்ப்பாசன ஆலோசனை", fertilizer: "உர ஆலோசனை", reports: "அறிக்கைகள்", settings: "அமைப்புகள்", profile: "என் சுயவிவரம்", home: "முகப்பு", scan: "ஸ்கேன்", irrigate: "நீர்ப்பாசனம்" },
    header: { search: "பண்ணை, பயிரைத் தேடுங்கள்...", language: "டாஷ்போர்டு மொழி" },
    help: { title: "பயிர் படிவ வழிகாட்டி", subtitle: "ஒவ்வொரு தேர்வின் பொருளும் பயனும்", example: "உதாரணம்", close: "பயிர் வழிகாட்டியை மூடு", button: "பயிர் உதவி", saved: "வெற்றிகரமாகப் பதிவு செய்யப்பட்டது." },
    advisor: { irrigation: "AI நீர்ப்பாசன ஆலோசகர்", fertilizer: "AI உர ஆலோசகர்", description: "தேர்ந்த பயிர், அதன் வளர்ச்சி நிலை, பண்ணை இடம், நேரடி வானிலை மற்றும் இணைக்கப்பட்ட நோய் ஸ்கேன்களை AI பயன்படுத்துகிறது.", chooseCrop: "பயிரைத் தேர்ந்தெடுக்கவும்", refreshWeather: "வானிலையைப் புதுப்பிக்கவும்", notRecorded: "பதிவில்லை", waterSource: "நீர் மூலம்", soil: "மண்", liveWeatherPending: "இந்தப் பண்ணைக்கான நேரடி வானிலை இன்னும் உறுதிசெய்யப்படவில்லை.", diseaseContext: "நோய் ஸ்கேன் தகவல்", noDisease: "இந்தப் பயிருடன் நோய் ஸ்கேன் இணைக்கப்படவில்லை:", safetyIntro: "AI ஆலோசனை முடிவெடுக்க உதவுகிறது. நீர் அல்லது ஊட்டச்சத்து அளிக்கும் முன் வயலையும் மண்ணையும் சரிபார்க்கவும்.", generate: "AI பரிந்துரையைப் பெறவும்", loading: "பண்ணைத் தகவல் ஆய்வு செய்யப்படுகிறது…", loadingDetail: "வானிலையைச் சரிபார்த்து, பயிர் பதிவுகளுடன் ஆலோசனை கேட்கப்படுகிறது…", retry: "மீண்டும் முயற்சிக்கவும்", inputError: "தேர்ந்த பயிர் அல்லது பண்ணைத் தகவலைச் சரிபார்க்கவும். நடவு தேதி, நீர் தேவை, பண்ணை இணைப்பை பார்த்து மீண்டும் முயற்சிக்கவும்.", recommendation: "AI பரிந்துரை", why: "ஏன்", when: "எப்போது", amount: "அளவு மற்றும் இடைவெளி", timing: "காலம்", application: "பயன்பாட்டு கவனங்கள்", disease: "நோய் தகவல்", missing: "இந்தப் பரிந்துரைக்குக் கிடைக்காத தகவல்", safety: "பாதுகாப்பு", verify: "AI ஆலோசனை தவறாக இருக்கலாம். நீர் அல்லது ஊட்டச்சத்து அளிக்கும் முன் மண்ணையும் பயிரையும் சரிபார்க்கவும்.", addFarm: "தொடர பண்ணையைச் சேர்க்கவும்", registerCrop: "தொடர பயிரைப் பதிவு செய்யவும்", addFarmDetail: "பண்ணை இடமும் மண் விவரங்களும் உங்கள் நிலத்துக்கேற்ற ஆலோசனைக்கு உதவும்.", registerCropDetail: "பயிர் நிலைக்கு ஏற்ற ஆலோசனைக்கு பண்ணையுடன் இணைக்கப்பட்ட பயிரைத் தேர்ந்தெடுக்கவும்.", openFertilizer: "உர ஆலோசனையைத் திறக்கவும் →", openIrrigation: "நீர்ப்பாசன ஆலோசனையைத் திறக்கவும் →", registeredCrops: "பதிவு செய்த பயிர்கள்", noFarmLink: "இந்தப் பயிர் கிடைக்கும் பண்ணையுடன் இணைக்கப்படவில்லை. Crop Management-இல் பண்ணைத் தேர்வைச் சரிபார்க்கவும்.", tryAgainNetwork: "AI ஆலோசனை இப்போது கிடைக்கவில்லை. இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்." },
  },
  ml: {
    nav: { dashboard: "ഡാഷ്ബോർഡ്", farms: "എന്റെ ഫാമുകൾ", crops: "വിളകൾ", disease: "രോഗ സ്കാനർ", plant: "സസ്യ തിരിച്ചറിയൽ", weather: "കാലാവസ്ഥ", irrigation: "ജലസേചന ഉപദേശം", fertilizer: "വള ഉപദേശം", reports: "റിപ്പോർട്ടുകൾ", settings: "ക്രമീകരണങ്ങൾ", profile: "എന്റെ പ്രൊഫൈൽ", home: "ഹോം", scan: "സ്കാൻ", irrigate: "ജലസേചനം" },
    header: { search: "ഫാം, വിള തിരയുക...", language: "ഡാഷ്ബോർഡ് ഭാഷ" },
    help: { title: "വിള ഫോം സഹായം", subtitle: "ഓരോ ഓപ്ഷന്റെയും അർത്ഥവും ഉപയോഗവും", example: "ഉദാഹരണം", close: "വിള സഹായം അടയ്ക്കുക", button: "വിള സഹായം", saved: "വിജയകരമായി രജിസ്റ്റർ ചെയ്തു." },
    advisor: { irrigation: "AI ജലസേചന ഉപദേശകൻ", fertilizer: "AI വള ഉപദേശകൻ", description: "തിരഞ്ഞെടുത്ത വിള, വളർച്ചാഘട്ടം, ഫാം സ്ഥലം, തത്സമയ കാലാവസ്ഥ, ബന്ധിപ്പിച്ച രോഗ സ്കാനുകൾ എന്നിവ AI പരിഗണിക്കുന്നു.", chooseCrop: "വിള തിരഞ്ഞെടുക്കുക", refreshWeather: "കാലാവസ്ഥ പുതുക്കുക", notRecorded: "രേഖപ്പെടുത്തിയിട്ടില്ല", waterSource: "ജലസ്രോതസ്സ്", soil: "മണ്ണ്", liveWeatherPending: "ഈ ഫാമിലെ തത്സമയ കാലാവസ്ഥ ഇതുവരെ സ്ഥിരീകരിച്ചിട്ടില്ല.", diseaseContext: "രോഗ സ്കാൻ വിവരം", noDisease: "ഈ വിളയുമായി രോഗ സ്കാൻ ബന്ധിപ്പിച്ചിട്ടില്ല:", safetyIntro: "AI നിർദേശം തീരുമാനത്തിന് സഹായം മാത്രം. വെള്ളമോ പോഷകമോ നൽകുന്നതിന് മുമ്പ് വയലും മണ്ണും പരിശോധിക്കുക.", generate: "AI നിർദേശം നേടുക", loading: "ഫാം വിവരങ്ങൾ പരിശോധിക്കുന്നു…", loadingDetail: "കാലാവസ്ഥ പരിശോധിച്ച് വിള രേഖകൾ ഉപയോഗിച്ച് AI നിർദേശം ചോദിക്കുന്നു…", retry: "വീണ്ടും ശ്രമിക്കുക", inputError: "തിരഞ്ഞെടുത്ത വിളയുടെയോ ഫാമിന്റെയോ വിവരങ്ങൾ പരിശോധിക്കുക. നടീൽ തീയതി, ജലാവശ്യം, ഫാം ബന്ധം ശരിയാക്കി വീണ്ടും ശ്രമിക്കുക.", recommendation: "AI നിർദേശം", why: "കാരണം", when: "എപ്പോൾ", amount: "അളവും ഇടവേളയും", timing: "സമയം", application: "പ്രയോഗിക്കുമ്പോൾ ശ്രദ്ധിക്കുക", disease: "രോഗ വിവരം", missing: "ഈ നിർദേശത്തിന് ലഭ്യമല്ലാത്ത വിവരം", safety: "സുരക്ഷ", verify: "AI നിർദേശം തെറ്റായിരിക്കാം. വെള്ളമോ പോഷകമോ നൽകുന്നതിന് മുമ്പ് മണ്ണും വിളയും പരിശോധിക്കുക.", addFarm: "തുടരാൻ ഒരു ഫാം ചേർക്കുക", registerCrop: "തുടരാൻ ഒരു വിള രജിസ്റ്റർ ചെയ്യുക", addFarmDetail: "ഫാമിന്റെ സ്ഥലവും മണ്ണിന്റെ വിവരവും ഭൂമിക്ക് അനുയോജ്യമായ നിർദേശത്തിന് സഹായിക്കുന്നു.", registerCropDetail: "വിളയുടെ വളർച്ചാഘട്ടത്തിന് യോജിച്ച നിർദേശത്തിന് ഫാമുമായി ബന്ധിപ്പിച്ച വിള തിരഞ്ഞെടുക്കുക.", openFertilizer: "വള ഉപദേശം തുറക്കുക →", openIrrigation: "ജലസേചന ഉപദേശം തുറക്കുക →", registeredCrops: "രജിസ്റ്റർ ചെയ്ത വിളകൾ", noFarmLink: "ഈ വിള ലഭ്യമായ ഫാമുമായി ബന്ധിപ്പിച്ചിട്ടില്ല. Crop Management-ൽ ഫാം തിരഞ്ഞെടുപ്പ് പരിശോധിക്കുക.", tryAgainNetwork: "AI ഉപദേശം ഇപ്പോൾ ലഭ്യമല്ല. കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക." },
  },
} as const;

export type AdvisorCopyKey = keyof typeof text.en.advisor;
export type HelpCopyKey = keyof typeof text.en.help;

export function normalizeLanguage(value: string | null | undefined): AppLanguage {
  return SUPPORTED_LANGUAGES.find((language) => language.code === value)?.code ?? DEFAULT_LANGUAGE;
}

export function getUiText(language: string | null | undefined) {
  return text[normalizeLanguage(language)];
}

const dashboardText = {
  en: {
    overview: "Farm overview", welcome: "Welcome back", summary: "Your farms, crop health, and local conditions in one place.", addFarm: "Add farm",
    farms: "Total Farms", farmsAdded: "{count} farms added", activeFarms: "{count} active farms", area: "Total Area", acres: "Acres", cultivatedArea: "Total Cultivated Area",
    crops: "Registered Crops", cropsRegistered: "{count} crops registered", activeCrops: "{count} active crops", diseaseAlerts: "Disease Alerts", active: "{count} Active", actionRequired: "Action required", criticalAlerts: "{count} Critical alerts",
    mapTitle: "Registered Farms Map (View Only)", selectedLocation: "Selected location", satelliteHint: "Satellite shows places; Hybrid adds road labels", street: "Street", satellite: "Satellite", hybrid: "Hybrid", mapLoading: "Loading map…",
    activity: "Recent Farm Activity", alerts: "Active Crop Disease Alerts", quickActions: "Quick Actions", noActivity: "No recent activity records", addFirstFarm: "Add your first farm or perform an AI crop scan to populate your timeline.",
    noAlerts: "No Active Disease Alerts", healthyCrops: "Your registered crops are healthy and free of critical disease diagnoses.",
    humidity: "Humidity", wind: "Wind", rainRisk: "Rain Risk", refreshWeather: "Refresh Weather", updating: "Updating…", estimated: "Estimated", liveWeather: "Live Weather", weather: "Weather", weatherUnavailable: "Weather unavailable", detectingGps: "Detecting GPS…", soilTemp: "Soil Temp", unavailable: "Unavailable", fullForecast: "Full 7-Day Forecast →", estimateNote: "Estimate · live feed unavailable",
    irrigation: "Irrigation Advisor", getAiAdvice: "Get AI advice →", liveWeatherAvailable: "Live weather is available", noLiveWeather: "No verified live farm weather", forecastRain: "Forecast rain {rain}%; modeled soil moisture {moisture} m³/m³. This is context only, not a field sensor reading or irrigation order.", noSensor: "No field sensor reading is stored. Open the advisor for guidance based on live farm weather.", registeredCrops: "Registered crops", fertilizerAi: "Fertilizer AI", adviceOnPage: "Advice on page", addFarmBeforeAdvice: "Add a farm before requesting crop-specific irrigation advice.", registerCropForAdvice: "Register a crop to receive irrigation guidance based on its life stage.", addCrop: "Add crop", cropWaterNeed: "water need",
    quickAddFarm: "Add Farm", quickDisease: "Disease Scanner", quickPlant: "Plant ID", quickIrrigation: "Irrigation", quickReports: "Reports",
  },
  kn: {
    overview: "ಜಮೀನಿನ ಅವಲೋಕನ", welcome: "ಮರಳಿ ಸ್ವಾಗತ", summary: "ನಿಮ್ಮ ಜಮೀನು, ಬೆಳೆ ಆರೋಗ್ಯ ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗಳು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ.", addFarm: "ಜಮೀನು ಸೇರಿಸಿ",
    farms: "ಒಟ್ಟು ಜಮೀನುಗಳು", farmsAdded: "{count} ಜಮೀನುಗಳನ್ನು ಸೇರಿಸಲಾಗಿದೆ", activeFarms: "{count} ಸಕ್ರಿಯ ಜಮೀನುಗಳು", area: "ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ", acres: "ಎಕರೆ", cultivatedArea: "ಒಟ್ಟು ಕೃಷಿ ವಿಸ್ತೀರ್ಣ",
    crops: "ನೋಂದಾಯಿಸಿದ ಬೆಳೆಗಳು", cropsRegistered: "{count} ಬೆಳೆಗಳನ್ನು ನೋಂದಾಯಿಸಲಾಗಿದೆ", activeCrops: "{count} ಸಕ್ರಿಯ ಬೆಳೆಗಳು", diseaseAlerts: "ರೋಗ ಎಚ್ಚರಿಕೆಗಳು", active: "{count} ಸಕ್ರಿಯ", actionRequired: "ಕ್ರಮ ಅಗತ್ಯ", criticalAlerts: "{count} ಗಂಭೀರ ಎಚ್ಚರಿಕೆಗಳು",
    mapTitle: "ನೋಂದಾಯಿಸಿದ ಜಮೀನುಗಳ ನಕ್ಷೆ (ವೀಕ್ಷಣೆ ಮಾತ್ರ)", selectedLocation: "ಆಯ್ದ ಸ್ಥಳ", satelliteHint: "ಉಪಗ್ರಹದಲ್ಲಿ ಸ್ಥಳಗಳು; ಹೈಬ್ರಿಡ್‌ನಲ್ಲಿ ರಸ್ತೆ ಹೆಸರುಗಳು", street: "ರಸ್ತೆ", satellite: "ಉಪಗ್ರಹ", hybrid: "ಹೈಬ್ರಿಡ್", mapLoading: "ನಕ್ಷೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    activity: "ಇತ್ತೀಚಿನ ಜಮೀನಿನ ಚಟುವಟಿಕೆ", alerts: "ಸಕ್ರಿಯ ಬೆಳೆ ರೋಗ ಎಚ್ಚರಿಕೆಗಳು", quickActions: "ತ್ವರಿತ ಕಾರ್ಯಗಳು", noActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ ದಾಖಲೆಗಳಿಲ್ಲ", addFirstFarm: "ಚಟುವಟಿಕೆಗಳನ್ನು ನೋಡಲು ಮೊದಲ ಜಮೀನು ಸೇರಿಸಿ ಅಥವಾ AI ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    noAlerts: "ಸಕ್ರಿಯ ರೋಗ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ", healthyCrops: "ನೋಂದಾಯಿಸಿದ ಬೆಳೆಗಳಲ್ಲಿ ಗಂಭೀರ ರೋಗ ಪತ್ತೆಯಾಗಿಲ್ಲ.",
    humidity: "ಆರ್ದ್ರತೆ", wind: "ಗಾಳಿ", rainRisk: "ಮಳೆಯ ಸಾಧ್ಯತೆ", refreshWeather: "ಹವಾಮಾನ ನವೀಕರಿಸಿ", updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ…", estimated: "ಅಂದಾಜು", liveWeather: "ನೈಜ ಹವಾಮಾನ", weather: "ಹವಾಮಾನ", weatherUnavailable: "ಹವಾಮಾನ ಲಭ್ಯವಿಲ್ಲ", detectingGps: "GPS ಪತ್ತೆಯಾಗುತ್ತಿದೆ…", soilTemp: "ಮಣ್ಣಿನ ತಾಪಮಾನ", unavailable: "ಲಭ್ಯವಿಲ್ಲ", fullForecast: "7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ →", estimateNote: "ಅಂದಾಜು · ನೈಜ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
    irrigation: "ನೀರಾವರಿ ಸಲಹೆಗಾರ", getAiAdvice: "AI ಸಲಹೆ ಪಡೆಯಿರಿ →", liveWeatherAvailable: "ನೈಜ ಹವಾಮಾನ ಲಭ್ಯವಿದೆ", noLiveWeather: "ಜಮೀನಿನ ನೈಜ ಹವಾಮಾನ ದೃಢಪಟ್ಟಿಲ್ಲ", forecastRain: "ಮಳೆ ಸಾಧ್ಯತೆ {rain}%; ಅಂದಾಜು ಮಣ್ಣಿನ ತೇವಾಂಶ {moisture} m³/m³. ಇದು ಮಾಹಿತಿ ಮಾತ್ರ; ಸಂವೇದಕದ ಅಳತೆ ಅಥವಾ ನೀರಾವರಿ ಆದೇಶವಲ್ಲ.", noSensor: "ಹೊಲದ ಸಂವೇದಕದ ಅಳತೆ ದಾಖಲಾಗಿಲ್ಲ. ನೈಜ ಹವಾಮಾನದ ಆಧಾರದ ಸಲಹೆಗೆ ಸಲಹೆಗಾರ ತೆರೆಯಿರಿ.", registeredCrops: "ನೋಂದಾಯಿಸಿದ ಬೆಳೆಗಳು", fertilizerAi: "ಗೊಬ್ಬರ AI", adviceOnPage: "ಸಲಹೆ ಪುಟದಲ್ಲಿ", addFarmBeforeAdvice: "ಬೆಳೆ ಆಧಾರಿತ ನೀರಾವರಿ ಸಲಹೆಗೆ ಮೊದಲು ಜಮೀನು ಸೇರಿಸಿ.", registerCropForAdvice: "ಬೆಳೆಯ ಹಂತಕ್ಕೆ ತಕ್ಕ ನೀರಾವರಿ ಸಲಹೆಗೆ ಬೆಳೆ ನೋಂದಾಯಿಸಿ.", addCrop: "ಬೆಳೆ ಸೇರಿಸಿ", cropWaterNeed: "ನೀರಿನ ಅಗತ್ಯ",
    quickAddFarm: "ಜಮೀನು ಸೇರಿಸಿ", quickDisease: "ರೋಗ ಸ್ಕ್ಯಾನರ್", quickPlant: "ಸಸ್ಯ ಗುರುತು", quickIrrigation: "ನೀರಾವರಿ", quickReports: "ವರದಿಗಳು",
  },
  hi: {
    overview: "खेत का सारांश", welcome: "वापसी पर स्वागत है", summary: "आपके खेत, फसल का स्वास्थ्य और स्थानीय मौसम एक जगह।", addFarm: "खेत जोड़ें",
    farms: "कुल खेत", farmsAdded: "{count} खेत जोड़े गए", activeFarms: "{count} सक्रिय खेत", area: "कुल क्षेत्रफल", acres: "एकड़", cultivatedArea: "कुल खेती का क्षेत्र",
    crops: "दर्ज फसलें", cropsRegistered: "{count} फसलें दर्ज", activeCrops: "{count} सक्रिय फसलें", diseaseAlerts: "रोग चेतावनी", active: "{count} सक्रिय", actionRequired: "कार्रवाई जरूरी", criticalAlerts: "{count} गंभीर चेतावनी",
    mapTitle: "दर्ज खेतों का नक्शा (केवल देखें)", selectedLocation: "चुना हुआ स्थान", satelliteHint: "उपग्रह में स्थान; हाइब्रिड में सड़क के नाम", street: "सड़क", satellite: "उपग्रह", hybrid: "हाइब्रिड", mapLoading: "नक्शा लोड हो रहा है…",
    activity: "खेत की हाल की गतिविधि", alerts: "सक्रिय फसल रोग चेतावनी", quickActions: "त्वरित काम", noActivity: "हाल की गतिविधि दर्ज नहीं है", addFirstFarm: "गतिविधि देखने के लिए पहला खेत जोड़ें या AI फसल स्कैन करें।",
    noAlerts: "कोई सक्रिय रोग चेतावनी नहीं", healthyCrops: "दर्ज फसलों में गंभीर रोग की पहचान नहीं हुई है।",
    humidity: "नमी", wind: "हवा", rainRisk: "बारिश की संभावना", refreshWeather: "मौसम ताज़ा करें", updating: "अपडेट हो रहा है…", estimated: "अनुमानित", liveWeather: "ताज़ा मौसम", weather: "मौसम", weatherUnavailable: "मौसम उपलब्ध नहीं", detectingGps: "GPS खोज रहे हैं…", soilTemp: "मिट्टी का तापमान", unavailable: "उपलब्ध नहीं", fullForecast: "7 दिन का पूर्वानुमान →", estimateNote: "अनुमान · लाइव जानकारी उपलब्ध नहीं",
    irrigation: "सिंचाई सलाहकार", getAiAdvice: "AI सलाह लें →", liveWeatherAvailable: "खेत का ताज़ा मौसम उपलब्ध है", noLiveWeather: "खेत का ताज़ा मौसम सत्यापित नहीं है", forecastRain: "बारिश की संभावना {rain}%; अनुमानित मिट्टी की नमी {moisture} m³/m³। यह संदर्भ है, सेंसर माप या सिंचाई आदेश नहीं।", noSensor: "खेत के सेंसर की माप दर्ज नहीं है। लाइव मौसम पर सलाह के लिए सलाहकार खोलें।", registeredCrops: "दर्ज फसलें", fertilizerAi: "खाद AI", adviceOnPage: "सलाह पेज पर", addFarmBeforeAdvice: "फसल आधारित सिंचाई सलाह के लिए पहले खेत जोड़ें।", registerCropForAdvice: "फसल की अवस्था के अनुसार सलाह पाने के लिए फसल दर्ज करें।", addCrop: "फसल जोड़ें", cropWaterNeed: "पानी की जरूरत",
    quickAddFarm: "खेत जोड़ें", quickDisease: "रोग स्कैनर", quickPlant: "पौधे की पहचान", quickIrrigation: "सिंचाई", quickReports: "रिपोर्ट",
  },
  te: {
    overview: "పొలం అవలోకనం", welcome: "తిరిగి స్వాగతం", summary: "మీ పొలాలు, పంట ఆరోగ్యం, స్థానిక పరిస్థితులు ఒకేచోట.", addFarm: "పొలాన్ని జోడించండి",
    farms: "మొత్తం పొలాలు", farmsAdded: "{count} పొలాలు జోడించబడ్డాయి", activeFarms: "{count} క్రియాశీల పొలాలు", area: "మొత్తం విస్తీర్ణం", acres: "ఎకరాలు", cultivatedArea: "మొత్తం సాగు విస్తీర్ణం",
    crops: "నమోదైన పంటలు", cropsRegistered: "{count} పంటలు నమోదయ్యాయి", activeCrops: "{count} క్రియాశీల పంటలు", diseaseAlerts: "వ్యాధి హెచ్చరికలు", active: "{count} క్రియాశీలం", actionRequired: "చర్య అవసరం", criticalAlerts: "{count} తీవ్రమైన హెచ్చరికలు",
    mapTitle: "నమోదైన పొలాల మ్యాప్ (చూడటానికి మాత్రమే)", selectedLocation: "ఎంచుకున్న ప్రదేశం", satelliteHint: "ఉపగ్రహంలో ప్రదేశాలు; హైబ్రిడ్‌లో రహదారి పేర్లు", street: "రోడ్డు", satellite: "ఉపగ్రహం", hybrid: "హైబ్రిడ్", mapLoading: "మ్యాప్ లోడ్ అవుతోంది…",
    activity: "ఇటీవలి పొలం కార్యకలాపాలు", alerts: "క్రియాశీల పంట వ్యాధి హెచ్చరికలు", quickActions: "త్వరిత చర్యలు", noActivity: "ఇటీవలి కార్యకలాపాల రికార్డులు లేవు", addFirstFarm: "కార్యకలాపాలను చూడటానికి మొదటి పొలాన్ని జోడించండి లేదా AI పంట స్కాన్ చేయండి.",
    noAlerts: "క్రియాశీల వ్యాధి హెచ్చరికలు లేవు", healthyCrops: "నమోదైన పంటల్లో తీవ్రమైన వ్యాధి నిర్ధారణలు లేవు.",
    humidity: "తేమ", wind: "గాలి", rainRisk: "వర్ష సూచన", refreshWeather: "వాతావరణం నవీకరించండి", updating: "నవీకరిస్తోంది…", estimated: "అంచనా", liveWeather: "ప్రస్తుత వాతావరణం", weather: "వాతావరణం", weatherUnavailable: "వాతావరణం అందుబాటులో లేదు", detectingGps: "GPS గుర్తిస్తోంది…", soilTemp: "నేల ఉష్ణోగ్రత", unavailable: "అందుబాటులో లేదు", fullForecast: "7 రోజుల సూచన →", estimateNote: "అంచనా · ప్రత్యక్ష సమాచారం లేదు",
    irrigation: "సాగునీటి సలహాదారు", getAiAdvice: "AI సలహా పొందండి →", liveWeatherAvailable: "ప్రస్తుత వాతావరణం అందుబాటులో ఉంది", noLiveWeather: "పొలానికి ప్రత్యక్ష వాతావరణం నిర్ధారించలేదు", forecastRain: "వర్ష సూచన {rain}%; అంచనా నేల తేమ {moisture} m³/m³. ఇది సమాచారం మాత్రమే; సెన్సర్ కొలత లేదా సాగునీటి ఆదేశం కాదు.", noSensor: "పొలం సెన్సర్ కొలత నమోదు కాలేదు. ప్రత్యక్ష వాతావరణ ఆధారిత సలహా కోసం సలహాదారుని తెరవండి.", registeredCrops: "నమోదైన పంటలు", fertilizerAi: "ఎరువు AI", adviceOnPage: "సలహా పేజీలో", addFarmBeforeAdvice: "పంట ఆధారిత సాగునీటి సలహా కోసం ముందుగా పొలాన్ని జోడించండి.", registerCropForAdvice: "పంట దశకు తగ్గ సాగునీటి మార్గదర్శకానికి పంటను నమోదు చేయండి.", addCrop: "పంటను జోడించండి", cropWaterNeed: "నీటి అవసరం",
    quickAddFarm: "పొలం జోడించండి", quickDisease: "వ్యాధి స్కానర్", quickPlant: "మొక్క గుర్తింపు", quickIrrigation: "సాగునీరు", quickReports: "నివేదికలు",
  },
  ta: {
    overview: "பண்ணை கண்ணோட்டம்", welcome: "மீண்டும் வரவேற்கிறோம்", summary: "உங்கள் பண்ணைகள், பயிர் ஆரோக்கியம், உள்ளூர் நிலவரம் ஒரே இடத்தில்.", addFarm: "பண்ணையைச் சேர்க்கவும்",
    farms: "மொத்த பண்ணைகள்", farmsAdded: "{count} பண்ணைகள் சேர்க்கப்பட்டன", activeFarms: "{count} செயலில் உள்ள பண்ணைகள்", area: "மொத்த பரப்பளவு", acres: "ஏக்கர்", cultivatedArea: "மொத்த சாகுபடி பரப்பளவு",
    crops: "பதிவு செய்த பயிர்கள்", cropsRegistered: "{count} பயிர்கள் பதிவு", activeCrops: "{count} செயலில் உள்ள பயிர்கள்", diseaseAlerts: "நோய் எச்சரிக்கைகள்", active: "{count} செயலில்", actionRequired: "நடவடிக்கை தேவை", criticalAlerts: "{count} தீவிர எச்சரிக்கைகள்",
    mapTitle: "பதிவு செய்த பண்ணை வரைபடம் (பார்வைக்கு மட்டும்)", selectedLocation: "தேர்ந்தெடுத்த இடம்", satelliteHint: "செயற்கைக்கோளில் இடங்கள்; ஹைப்ரிடில் சாலைப் பெயர்கள்", street: "சாலை", satellite: "செயற்கைக்கோள்", hybrid: "ஹைப்ரிட்", mapLoading: "வரைபடம் ஏற்றப்படுகிறது…",
    activity: "சமீபத்திய பண்ணை செயல்பாடு", alerts: "செயலில் உள்ள பயிர் நோய் எச்சரிக்கைகள்", quickActions: "விரைவு செயல்கள்", noActivity: "சமீபத்திய செயல்பாட்டு பதிவுகள் இல்லை", addFirstFarm: "செயல்பாடுகளைப் பார்க்க முதல் பண்ணையைச் சேர்க்கவும் அல்லது AI பயிர் ஸ்கேன் செய்யவும்.",
    noAlerts: "செயலில் உள்ள நோய் எச்சரிக்கைகள் இல்லை", healthyCrops: "பதிவு செய்த பயிர்களில் தீவிர நோய் கண்டறிதல் இல்லை.",
    humidity: "ஈரப்பதம்", wind: "காற்று", rainRisk: "மழை வாய்ப்பு", refreshWeather: "வானிலையைப் புதுப்பிக்கவும்", updating: "புதுப்பிக்கிறது…", estimated: "மதிப்பீடு", liveWeather: "நேரடி வானிலை", weather: "வானிலை", weatherUnavailable: "வானிலை கிடைக்கவில்லை", detectingGps: "GPS கண்டறிகிறது…", soilTemp: "மண் வெப்பநிலை", unavailable: "கிடைக்கவில்லை", fullForecast: "7 நாள் முன்னறிவிப்பு →", estimateNote: "மதிப்பீடு · நேரடி தகவல் இல்லை",
    irrigation: "நீர்ப்பாசன ஆலோசகர்", getAiAdvice: "AI ஆலோசனை பெறுங்கள் →", liveWeatherAvailable: "நேரடி வானிலை கிடைக்கிறது", noLiveWeather: "பண்ணையின் நேரடி வானிலை சரிபார்க்கப்படவில்லை", forecastRain: "மழை வாய்ப்பு {rain}%; மதிப்பிடப்பட்ட மண் ஈரப்பதம் {moisture} m³/m³. இது தகவல் மட்டுமே; சென்சார் அளவீடோ நீர்ப்பாசன ஆணையோ அல்ல.", noSensor: "வயல் சென்சார் அளவீடு பதிவு செய்யப்படவில்லை. நேரடி வானிலை வழிகாட்டிக்கு ஆலோசகரைத் திறக்கவும்.", registeredCrops: "பதிவு செய்த பயிர்கள்", fertilizerAi: "உர AI", adviceOnPage: "ஆலோசனைப் பக்கத்தில்", addFarmBeforeAdvice: "பயிர் சார்ந்த நீர்ப்பாசன ஆலோசனைக்கு முதலில் பண்ணையைச் சேர்க்கவும்.", registerCropForAdvice: "பயிர் வளர்ச்சி நிலைக்கு ஆலோசனை பெற பயிரைப் பதிவு செய்யவும்.", addCrop: "பயிரைச் சேர்க்கவும்", cropWaterNeed: "நீர் தேவை",
    quickAddFarm: "பண்ணை சேர்க்கவும்", quickDisease: "நோய் ஸ்கேனர்", quickPlant: "தாவர அடையாளம்", quickIrrigation: "நீர்ப்பாசனம்", quickReports: "அறிக்கைகள்",
  },
  ml: {
    overview: "ഫാം അവലോകനം", welcome: "തിരികെ സ്വാഗതം", summary: "നിങ്ങളുടെ ഫാമുകൾ, വിളയുടെ ആരോഗ്യം, പ്രാദേശിക കാലാവസ്ഥ എന്നിവ ഒരിടത്ത്.", addFarm: "ഫാം ചേർക്കുക",
    farms: "ആകെ ഫാമുകൾ", farmsAdded: "{count} ഫാമുകൾ ചേർത്തു", activeFarms: "{count} സജീവ ഫാമുകൾ", area: "ആകെ വിസ്തീർണം", acres: "ഏക്കർ", cultivatedArea: "ആകെ കൃഷി വിസ്തീർണം",
    crops: "രജിസ്റ്റർ ചെയ്ത വിളകൾ", cropsRegistered: "{count} വിളകൾ രജിസ്റ്റർ ചെയ്തു", activeCrops: "{count} സജീവ വിളകൾ", diseaseAlerts: "രോഗ മുന്നറിയിപ്പുകൾ", active: "{count} സജീവം", actionRequired: "നടപടി ആവശ്യമാണ്", criticalAlerts: "{count} ഗുരുതര മുന്നറിയിപ്പുകൾ",
    mapTitle: "രജിസ്റ്റർ ചെയ്ത ഫാം മാപ്പ് (കാഴ്ചയ്ക്ക് മാത്രം)", selectedLocation: "തിരഞ്ഞെടുത്ത സ്ഥലം", satelliteHint: "സാറ്റലൈറ്റിൽ സ്ഥലങ്ങൾ; ഹൈബ്രിഡിൽ റോഡ് പേരുകൾ", street: "തെരുവ്", satellite: "സാറ്റലൈറ്റ്", hybrid: "ഹൈബ്രിഡ്", mapLoading: "മാപ്പ് ലോഡ് ചെയ്യുന്നു…",
    activity: "സമീപകാല ഫാം പ്രവർത്തനം", alerts: "സജീവ വിളരോഗ മുന്നറിയിപ്പുകൾ", quickActions: "വേഗത്തിലുള്ള പ്രവർത്തനങ്ങൾ", noActivity: "സമീപകാല പ്രവർത്തന രേഖകളില്ല", addFirstFarm: "പ്രവർത്തനങ്ങൾ കാണാൻ ആദ്യ ഫാം ചേർക്കുക അല്ലെങ്കിൽ AI വിള സ്കാൻ നടത്തുക.",
    noAlerts: "സജീവ രോഗ മുന്നറിയിപ്പുകളില്ല", healthyCrops: "രജിസ്റ്റർ ചെയ്ത വിളകളിൽ ഗുരുതര രോഗനിർണയങ്ങളില്ല.",
    humidity: "ഈർപ്പം", wind: "കാറ്റ്", rainRisk: "മഴ സാധ്യത", refreshWeather: "കാലാവസ്ഥ പുതുക്കുക", updating: "പുതുക്കുന്നു…", estimated: "കണക്കുകൂട്ടൽ", liveWeather: "തത്സമയ കാലാവസ്ഥ", weather: "കാലാവസ്ഥ", weatherUnavailable: "കാലാവസ്ഥ ലഭ്യമല്ല", detectingGps: "GPS കണ്ടെത്തുന്നു…", soilTemp: "മണ്ണിന്റെ താപനില", unavailable: "ലഭ്യമല്ല", fullForecast: "7 ദിവസത്തെ പ്രവചനം →", estimateNote: "കണക്കുകൂട്ടൽ · തത്സമയ വിവരം ലഭ്യമല്ല",
    irrigation: "ജലസേചന ഉപദേശകൻ", getAiAdvice: "AI ഉപദേശം നേടുക →", liveWeatherAvailable: "തത്സമയ കാലാവസ്ഥ ലഭ്യമാണ്", noLiveWeather: "ഫാമിലെ തത്സമയ കാലാവസ്ഥ സ്ഥിരീകരിച്ചിട്ടില്ല", forecastRain: "മഴ സാധ്യത {rain}%; കണക്കാക്കിയ മണ്ണിലെ ഈർപ്പം {moisture} m³/m³. ഇത് സന്ദർഭവിവരം മാത്രം; സെൻസർ അളവോ ജലസേചന നിർദേശമോ അല്ല.", noSensor: "വയൽ സെൻസർ അളവ് രേഖപ്പെടുത്തിയിട്ടില്ല. തത്സമയ കാലാവസ്ഥയെ അടിസ്ഥാനമാക്കിയുള്ള ഉപദേശത്തിന് ഉപദേശകൻ തുറക്കുക.", registeredCrops: "രജിസ്റ്റർ ചെയ്ത വിളകൾ", fertilizerAi: "വള AI", adviceOnPage: "ഉപദേശ പേജിൽ", addFarmBeforeAdvice: "വിളയെ അടിസ്ഥാനമാക്കിയ ജലസേചന ഉപദേശത്തിന് ആദ്യം ഫാം ചേർക്കുക.", registerCropForAdvice: "വിളയുടെ വളർച്ചാഘട്ടത്തിനനുസരിച്ച ഉപദേശത്തിന് വിള രജിസ്റ്റർ ചെയ്യുക.", addCrop: "വിള ചേർക്കുക", cropWaterNeed: "ജലാവശ്യം",
    quickAddFarm: "ഫാം ചേർക്കുക", quickDisease: "രോഗ സ്കാനർ", quickPlant: "സസ്യ തിരിച്ചറിയൽ", quickIrrigation: "ജലസേചനം", quickReports: "റിപ്പോർട്ടുകൾ",
  },
} as const;

export function getDashboardText(language: string | null | undefined) {
  return dashboardText[normalizeLanguage(language)];
}

export function getCropHelp(language: string | null | undefined): CropHelpEntry[] {
  return cropHelp[normalizeLanguage(language)];
}
