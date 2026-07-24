export const MOCK_USER = {
  name: "Ramesh Patel",
  role: "Farmer / Agriculture Officer",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  location: "Mandya District, Karnataka",
  subscription: "Premium",
};

export const MOCK_STATS = [
  {
    id: "farms",
    title: "Total Farms",
    value: "3 Farms",
    change: "+1 this season",
    trend: "up",
    iconName: "MapPin",
    color: "emerald",
  },
  {
    id: "area",
    title: "Total Area",
    value: "42.5 Acres",
    change: "Active Cultivation",
    trend: "neutral",
    iconName: "Maximize2",
    color: "blue",
  },
  {
    id: "crops",
    title: "Total Crops",
    value: "8 Varieties",
    change: "Wheat, Paddy, Sugarcane...",
    trend: "up",
    iconName: "Sprout",
    color: "amber",
  },
  {
    id: "alerts",
    title: "Disease Alerts",
    value: "2 Active",
    change: "Requires attention",
    trend: "down",
    iconName: "AlertTriangle",
    color: "rose",
  },
];

export const MOCK_WEATHER = {
  temperature: 28,
  condition: "Partly Cloudy",
  humidity: 68,
  windSpeed: 14,
  rainProbability: 75,
  rainfallExpected: "12 mm expected by 4:00 PM",
  location: "Mandya, KA",
  forecast: [
    { day: "Today", temp: "28°C / 20°C", condition: "Cloudy", rain: "75%" },
    { day: "Thu", temp: "30°C / 21°C", condition: "Sunny", rain: "10%" },
    { day: "Fri", temp: "29°C / 19°C", condition: "Partly Cloudy", rain: "30%" },
    { day: "Sat", temp: "27°C / 18°C", condition: "Heavy Rain", rain: "90%" },
    { day: "Sun", temp: "28°C / 20°C", condition: "Sunny", rain: "15%" },
  ],
};

export const MOCK_IRRIGATION_ADVICE = {
  recommendation: "Do Not Irrigate Today",
  status: "warning",
  reason: "Heavy rainfall (75% probability, ~12mm) forecasted in afternoon. Rain will provide sufficient moisture for all active fields.",
  waterSaved: "14,000 Liters saved",
  fieldStatuses: [
    { name: "Field 1 (Paddy)", moisture: "82% - Optimal", action: "No Irrigation Needed" },
    { name: "Field 2 (Wheat)", moisture: "64% - Good", action: "Hold until tomorrow" },
    { name: "Field 3 (Sugarcane)", moisture: "78% - Optimal", action: "No Irrigation Needed" },
  ],
};

export const MOCK_ALERTS = [
  {
    id: "alt-1",
    type: "disease",
    severity: "critical",
    title: "Yellow Rust Warning",
    field: "Wheat Field #2",
    time: "2 hours ago",
    description: "Gemini AI detected early stage Yellow Rust (89% confidence). Immediate fungicide treatment advised.",
  },
  {
    id: "alt-2",
    type: "weather",
    severity: "warning",
    title: "Heavy Rainfall Expected",
    field: "All Farms",
    time: "4 hours ago",
    description: "Thunderstorm alert issued for Mandya region between 3 PM - 7 PM today.",
  },
];

export const MOCK_RECENT_ACTIVITY = [
  {
    id: "act-1",
    type: "scan",
    title: "Crop Scan Completed",
    description: "Uploaded leaf image for Field #2. Disease: Yellow Rust detected.",
    time: "10:30 AM Today",
    badge: "Disease AI",
    badgeColor: "rose",
  },
  {
    id: "act-2",
    type: "irrigation",
    title: "Smart Irrigation Update",
    description: "Automatic hold applied to drip irrigation schedule for Field #1.",
    time: "08:15 AM Today",
    badge: "Irrigation",
    badgeColor: "blue",
  },
  {
    id: "act-3",
    type: "boundary",
    title: "Farm Boundary Updated",
    description: "GPS walk recording completed for 'Green Valley Farm' (14.2 acres).",
    time: "Yesterday, 5:40 PM",
    badge: "GPS Mapping",
    badgeColor: "emerald",
  },
  {
    id: "act-4",
    type: "crop",
    title: "New Crop Registered",
    description: "Sowing date logged for Sugarcane (Co 0238) in Field #3.",
    time: "2 days ago",
    badge: "Crop Mgmt",
    badgeColor: "amber",
  },
];

export const MOCK_FARMS = [
  {
    id: "farm-1",
    name: "Green Valley Farm",
    area: "18.5 Acres",
    crop: "Paddy & Sugarcane",
    status: "Healthy",
    coordinates: { lat: 12.5218, lng: 76.8951 },
    polygon: [
      [12.522, 76.894],
      [12.524, 76.896],
      [12.521, 76.898],
      [12.519, 76.895],
    ],
  },
  {
    id: "farm-2",
    name: "Sunrise Agro Farm",
    area: "14.2 Acres",
    crop: "Wheat & Mustard",
    status: "Alert Active",
    coordinates: { lat: 12.528, lng: 76.901 },
    polygon: [
      [12.528, 76.9],
      [12.53, 76.902],
      [12.527, 76.904],
      [12.525, 76.901],
    ],
  },
  {
    id: "farm-3",
    name: "Riverbank Plantation",
    area: "9.8 Acres",
    crop: "Maize & Pulses",
    status: "Optimal",
    coordinates: { lat: 12.515, lng: 76.889 },
    polygon: [
      [12.515, 76.888],
      [12.517, 76.891],
      [12.514, 76.892],
      [12.513, 76.889],
    ],
  },
];
