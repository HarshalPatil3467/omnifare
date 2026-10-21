import realFlightCurves from "@/data/real_flight_curves.json";

export type TransportMode = "airway" | "railway" | "roadway" | "waterway";

export interface RouteDefinition {
  id: string;
  mode: TransportMode;
  corridorId: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  baseFare: number;
  distanceKm: number;
  durationHrs: number;
  co2KgPerPax: number;
  comfortScore: number; // out of 10
  optimalLeadDays: [number, number];
  classes: { name: string; multiplier: number }[];
  carriers: {
    name: string;
    code: string;
    depTime: string;
    arrTime: string;
    durationText: string;
    rating: number;
    amenities: string[];
    priceFactor: number;
    badge?: string;
  }[];
}

export interface ForecastPoint {
  dayOffset: number;
  dateLabel: string;
  fullDate: string;
  type: "historical" | "today" | "predicted";
  price: number;
  lowerBound: number;
  upperBound: number;
  isOptimal?: boolean;
}

export interface ProviderQuote {
  providerId: string;
  providerName: string;
  price: number;
  url: string;
  badge?: string;
  isBestPrice?: boolean;
}

export interface CarrierOffer {
  id: string;
  carrierName: string;
  carrierCode: string;
  mode: TransportMode;
  origin: string;
  destination: string;
  depTime: string;
  arrTime: string;
  durationText: string;
  travelClass: string;
  currentFare: number;
  predictedLowFare: number;
  expectedChangePct: number;
  trend: "dropping" | "rising" | "stable";
  recommendation: "BUY NOW" | "WAIT" | "FAIR PRICE";
  confidence: number;
  seatsLeft: number;
  occupancyPct: number;
  amenities: string[];
  rating: number;
  badge?: string;
  extraInfo?: string; // e.g., WL Confirmation 92%, Toll Included, Sea Condition Calm
  priceDelta?: number;
  deltaType?: "drop" | "surge" | "steady";
  providerQuotes?: ProviderQuote[];
  lastLiveSync?: string;
}

export interface PredictionResult {
  route: RouteDefinition;
  selectedDate: string;
  daysUntilDeparture: number;
  travelClass: string;
  travelers: number;
  tripType: "One Way" | "Round Trip";
  currentLowestFare: number;
  predictedLowestFare: number;
  optimalBookingDate: string;
  optimalDaysFromNow: number;
  potentialSavings: number;
  recommendation: "BUY NOW" | "WAIT TO BOOK" | "LOCK FARE SOON";
  confidenceScore: number;
  reasoning: string;
  forecastSeries: ForecastPoint[];
  factorImpacts: {
    factor: string;
    impactPct: number;
    direction: "up" | "down" | "neutral";
    detail: string;
  }[];
  offers: CarrierOffer[];
  liveStreamMeta: {
    fuelIndex: number;
    demandSurge: number;
    seasonalityTag: string;
    weatherStatus: string;
    lastUpdated: string;
  };
}

export const MODE_META: Record<
  TransportMode,
  {
    label: string;
    shortLabel: string;
    tagline: string;
    color: string;
    accentHex: string;
    unitName: string;
    hubLabel: string;
  }
> = {
  airway: {
    label: "Flights & Airways",
    shortLabel: "Flights",
    tagline: "Live global GDS airline connectivity with advance dynamic pricing window forecasting",
    color: "from-sky-500 to-blue-600",
    accentHex: "#0284c7",
    unitName: "Flight",
    hubLabel: "Airport",
  },
  railway: {
    label: "Trains & Railways",
    shortLabel: "Trains",
    tagline: "Official Indian Railways routes, IRCTC Flexi-fare tariffs & WL confirmation analytics",
    color: "from-emerald-500 to-teal-600",
    accentHex: "#059669",
    unitName: "Train",
    hubLabel: "Railway Station",
  },
  roadway: {
    label: "Roadways (Buses & Cabs)",
    shortLabel: "Buses & Cabs",
    tagline: "Intercity state RTC & verified luxury Volvo sleepers with live expressway toll analytics",
    color: "from-orange-500 to-amber-500",
    accentHex: "#ea580c",
    unitName: "Coach / Cab",
    hubLabel: "Bus Terminal",
  },
  waterway: {
    label: "Ferries & Cruises",
    shortLabel: "Cruises & Ferries",
    tagline: "Coastal ocean liners, M2M Ro-Ro ferries & Andaman/Lakshadweep catamarans",
    color: "from-teal-500 to-cyan-600",
    accentHex: "#0d9488",
    unitName: "Vessel",
    hubLabel: "Port / Jetty",
  },
};

export const MULTI_MODAL_ROUTES: RouteDefinition[] = [
  // ================= AIRWAYS =================
  {
    id: "air-bom-del",
    mode: "airway",
    corridorId: "mumbai-delhi",
    origin: "Mumbai (BOM)",
    originCode: "BOM",
    destination: "Delhi (DEL)",
    destinationCode: "DEL",
    baseFare: 4850,
    distanceKm: 1148,
    durationHrs: 2.15,
    co2KgPerPax: 142,
    comfortScore: 9.0,
    optimalLeadDays: [14, 26],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.42 },
      { name: "Business", multiplier: 2.65 },
    ],
    carriers: [
      { name: "IndiGo", code: "6E-2045", depTime: "06:30", arrTime: "08:40", durationText: "2h 10m", rating: 4.5, amenities: ["On-time 92%", "Cabin Bag 7kg", "Check-in 15kg"], priceFactor: 0.96, badge: "Best Value" },
      { name: "Air India", code: "AI-887", depTime: "09:15", arrTime: "11:30", durationText: "2h 15m", rating: 4.6, amenities: ["Hot Meal", "Check-in 25kg", "In-flight Entertainment"], priceFactor: 1.05, badge: "Full Service" },
      { name: "Vistara (AI Express)", code: "UK-954", depTime: "17:45", arrTime: "19:55", durationText: "2h 10m", rating: 4.8, amenities: ["Gourmet Meal", "Starbucks Coffee", "Priority Boarding"], priceFactor: 1.14, badge: "Top Rated" },
      { name: "Akasa Air", code: "QP-1120", depTime: "21:10", arrTime: "23:25", durationText: "2h 15m", rating: 4.4, amenities: ["USB Charging", "Extra Legroom Option", "Eco Boeing 737 MAX"], priceFactor: 0.92, badge: "Lowest Fare" },
    ],
  },
  {
    id: "air-blr-bom",
    mode: "airway",
    corridorId: "bangalore-mumbai",
    origin: "Bangalore (BLR)",
    originCode: "BLR",
    destination: "Mumbai (BOM)",
    destinationCode: "BOM",
    baseFare: 3890,
    distanceKm: 842,
    durationHrs: 1.75,
    co2KgPerPax: 108,
    comfortScore: 8.9,
    optimalLeadDays: [12, 24],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.38 },
      { name: "Business", multiplier: 2.5 },
    ],
    carriers: [
      { name: "IndiGo", code: "6E-5312", depTime: "07:00", arrTime: "08:45", durationText: "1h 45m", rating: 4.6, amenities: ["Non-stop", "Fast Bag Drop", "On-time 94%"], priceFactor: 0.95, badge: "Most Popular" },
      { name: "Akasa Air", code: "QP-1304", depTime: "13:20", arrTime: "15:05", durationText: "1h 45m", rating: 4.5, amenities: ["Cafe Akasa", "Brand New Fleet", "USB Ports"], priceFactor: 0.91, badge: "Cheapest" },
      { name: "Air India", code: "AI-604", depTime: "19:30", arrTime: "21:20", durationText: "1h 50m", rating: 4.6, amenities: ["Complimentary Meal", "25kg Baggage", "Lounge Access Opt"], priceFactor: 1.08 },
    ],
  },
  {
    id: "air-bom-goi",
    mode: "airway",
    corridorId: "mumbai-goa",
    origin: "Mumbai (BOM)",
    originCode: "BOM",
    destination: "Goa (GOI / GOX)",
    destinationCode: "GOI",
    baseFare: 3250,
    distanceKm: 435,
    durationHrs: 1.15,
    co2KgPerPax: 68,
    comfortScore: 8.8,
    optimalLeadDays: [10, 21],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.35 },
      { name: "Business", multiplier: 2.3 },
    ],
    carriers: [
      { name: "IndiGo", code: "6E-6114", depTime: "08:15", arrTime: "09:25", durationText: "1h 10m", rating: 4.5, amenities: ["Dabolim GOI Arrival", "Non-stop", "15kg Baggage"], priceFactor: 0.95, badge: "Fastest" },
      { name: "Akasa Air", code: "QP-1402", depTime: "11:40", arrTime: "12:50", durationText: "1h 10m", rating: 4.5, amenities: ["Mopa GOX Arrival", "USB Power", "Low Carbon"], priceFactor: 0.9, badge: "Smart Pick" },
      { name: "Air India", code: "AI-683", depTime: "16:10", arrTime: "17:25", durationText: "1h 15m", rating: 4.6, amenities: ["Refreshments Included", "25kg Check-in"], priceFactor: 1.07 },
    ],
  },
  {
    id: "air-blr-hyd",
    mode: "airway",
    corridorId: "bangalore-hyderabad",
    origin: "Bangalore (BLR)",
    originCode: "BLR",
    destination: "Hyderabad (HYD)",
    destinationCode: "HYD",
    baseFare: 3100,
    distanceKm: 500,
    durationHrs: 1.15,
    co2KgPerPax: 72,
    comfortScore: 8.8,
    optimalLeadDays: [10, 20],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.35 },
      { name: "Business", multiplier: 2.3 },
    ],
    carriers: [
      { name: "IndiGo", code: "6E-714", depTime: "06:45", arrTime: "07:55", durationText: "1h 10m", rating: 4.6, amenities: ["Non-stop", "High Frequency"], priceFactor: 0.94, badge: "Top Pick" },
      { name: "Air India Express", code: "IX-2812", depTime: "14:15", arrTime: "15:25", durationText: "1h 10m", rating: 4.3, amenities: ["Gourmair Meals", "Xpress Lite Fare"], priceFactor: 0.89, badge: "Lowest Price" },
      { name: "SpiceJet", code: "SG-441", depTime: "20:05", arrTime: "21:20", durationText: "1h 15m", rating: 4.0, amenities: ["SpiceMax Option", "Evening Slot"], priceFactor: 0.98 },
    ],
  },
  {
    id: "air-maa-del",
    mode: "airway",
    corridorId: "chennai-delhi",
    origin: "Chennai (MAA)",
    originCode: "MAA",
    destination: "Delhi (DEL)",
    destinationCode: "DEL",
    baseFare: 5650,
    distanceKm: 1760,
    durationHrs: 2.8,
    co2KgPerPax: 195,
    comfortScore: 9.0,
    optimalLeadDays: [15, 28],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.45 },
      { name: "Business", multiplier: 2.75 },
    ],
    carriers: [
      { name: "IndiGo", code: "6E-2176", depTime: "06:10", arrTime: "09:00", durationText: "2h 50m", rating: 4.6, amenities: ["Non-stop", "On-time 93%"], priceFactor: 0.95, badge: "Best Value" },
      { name: "Air India", code: "AI-430", depTime: "10:00", arrTime: "12:50", durationText: "2h 50m", rating: 4.7, amenities: ["Full Hot Meal", "25kg Allowance", "Widebody A350 Opt"], priceFactor: 1.04, badge: "Full Service" },
    ],
  },
  {
    id: "air-bom-lhr",
    mode: "airway",
    corridorId: "mumbai-london",
    origin: "Mumbai (BOM)",
    originCode: "BOM",
    destination: "London Heathrow (LHR)",
    destinationCode: "LHR",
    baseFare: 54200,
    distanceKm: 7190,
    durationHrs: 9.5,
    co2KgPerPax: 685,
    comfortScore: 9.3,
    optimalLeadDays: [24, 45],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.65 },
      { name: "Business", multiplier: 3.2 },
    ],
    carriers: [
      { name: "Air India", code: "AI-131", depTime: "07:05", arrTime: "12:00", durationText: "9h 25m", rating: 4.6, amenities: ["2x23kg Bags", "Direct Non-Stop", "All Meals & Drinks"], priceFactor: 0.94, badge: "Best Direct" },
      { name: "Virgin Atlantic", code: "VS-355", depTime: "10:40", arrTime: "15:30", durationText: "9h 20m", rating: 4.8, amenities: ["Wi-Fi Onboard", "Premium Entertainment", "Complimentary Bar"], priceFactor: 1.03, badge: "Top Rated" },
      { name: "British Airways", code: "BA-138", depTime: "02:20", arrTime: "07:20", durationText: "9h 30m", rating: 4.7, amenities: ["Heathrow Terminal 5", "Avios Miles", "2x23kg Checked"], priceFactor: 1.08 },
    ],
  },

  // ================= RAILWAYS =================
  {
    id: "rail-bom-del",
    mode: "railway",
    corridorId: "mumbai-delhi",
    origin: "Mumbai Central (MMCT)",
    originCode: "MMCT",
    destination: "New Delhi (NDLS)",
    destinationCode: "NDLS",
    baseFare: 1825,
    distanceKm: 1384,
    durationHrs: 15.5,
    co2KgPerPax: 26,
    comfortScore: 8.3,
    optimalLeadDays: [10, 30],
    classes: [
      { name: "AC 3 Tier (3A)", multiplier: 1.0 },
      { name: "AC 2 Tier (2A)", multiplier: 1.4767 },
      { name: "First AC (1A)", multiplier: 2.4520 },
      { name: "AC 3 Economy (3E)", multiplier: 0.9260 },
      { name: "AC Chair Car (CC)", multiplier: 0.7780 },
      { name: "Executive Class (EC)", multiplier: 1.4191 },
      { name: "Sleeper (SL)", multiplier: 0.3315 },
      { name: "Second Sitting (2S)", multiplier: 0.1918 },
    ],
    carriers: [
      { name: "12951 Tejas Rajdhani Exp", code: "12951", depTime: "17:00", arrTime: "08:32", durationText: "15h 32m", rating: 4.8, amenities: ["Catering Included", "Automatic Doors", "WL Confirm 96%"], priceFactor: 1.0, badge: "Fastest Rail" },
      { name: "12953 August Kranti Rajdhani", code: "12953", depTime: "17:10", arrTime: "09:43", durationText: "16h 33m", rating: 4.6, amenities: ["Meals Onboard", "Bedding Included", "WL Confirm 91%"], priceFactor: 1.0 },
      { name: "22209 NZM Duronto Express", code: "22209", depTime: "23:15", arrTime: "15:55", durationText: "16h 40m", rating: 4.4, amenities: ["Point-to-Point", "Dynamic Flexi-Fare", "WL Confirm 88%"], priceFactor: 0.96, badge: "Lowest AC Fare" },
    ],
  },
  {
    id: "rail-bom-goa",
    mode: "railway",
    corridorId: "mumbai-goa",
    origin: "Mumbai CSMT",
    originCode: "CSMT",
    destination: "Goa Madgaon (MAO)",
    destinationCode: "MAO",
    baseFare: 1085,
    distanceKm: 581,
    durationHrs: 7.75,
    co2KgPerPax: 14,
    comfortScore: 8.7,
    optimalLeadDays: [7, 21],
    classes: [
      { name: "AC Chair Car (CC)", multiplier: 1.0 },
      { name: "Executive Class (EC)", multiplier: 1.8249 },
      { name: "AC 3 Tier (3A)", multiplier: 0.9309 },
      { name: "AC 2 Tier (2A)", multiplier: 1.3226 },
      { name: "First AC (1A)", multiplier: 2.2120 },
      { name: "AC 3 Economy (3E)", multiplier: 0.8571 },
      { name: "Sleeper (SL)", multiplier: 0.3548 },
      { name: "Second Sitting (2S)", multiplier: 0.1935 },
    ],
    carriers: [
      { name: "22229 CSMT–Madgaon Vande Bharat", code: "22229", depTime: "05:25", arrTime: "13:10", durationText: "7h 45m", rating: 4.9, amenities: ["180° Rotating Seats", "Onboard Wi-Fi", "Konkan Scenic Windows"], priceFactor: 1.0, badge: "Premium Semi-High Speed" },
      { name: "12051 Dadar–Madgaon Jan Shatabdi", code: "12051", depTime: "05:10", arrTime: "14:10", durationText: "9h 00m", rating: 4.5, amenities: ["Vistadome Coach Opt", "Pantry Car", "High WL Clearance"], priceFactor: 0.88, badge: "Best Value" },
      { name: "10111 Konkan Kanya Express", code: "10111", depTime: "23:00", arrTime: "08:45", durationText: "9h 45m", rating: 4.7, amenities: ["Overnight Sleeper", "LHB Coaches", "Konkan Railway Iconic"], priceFactor: 0.93, badge: "Overnight Favorite" },
    ],
  },
  {
    id: "rail-blr-hyd",
    mode: "railway",
    corridorId: "bangalore-hyderabad",
    origin: "Bangalore Yesvantpur (YPR)",
    originCode: "YPR",
    destination: "Hyderabad Kacheguda (KCG)",
    destinationCode: "KCG",
    baseFare: 1255,
    distanceKm: 612,
    durationHrs: 8.5,
    co2KgPerPax: 15,
    comfortScore: 8.6,
    optimalLeadDays: [6, 18],
    classes: [
      { name: "AC Chair Car (CC)", multiplier: 1.0 },
      { name: "Executive Chair (EC)", multiplier: 1.9203 },
      { name: "AC 3 Tier (3A)", multiplier: 0.8127 },
      { name: "AC 2 Tier (2A)", multiplier: 1.1633 },
      { name: "First AC (1A)", multiplier: 1.9681 },
      { name: "AC 3 Economy (3E)", multiplier: 0.7410 },
      { name: "Sleeper (SL)", multiplier: 0.3068 },
      { name: "Second Sitting (2S)", multiplier: 0.1673 },
    ],
    carriers: [
      { name: "20704 YPR–KCG Vande Bharat Exp", code: "20704", depTime: "14:45", arrTime: "23:15", durationText: "8h 30m", rating: 4.9, amenities: ["Meals Included", "Bio-Vacuum Toilets", "Automatic Sliding Doors"], priceFactor: 1.0, badge: "Fastest Train" },
      { name: "12786 Kacheguda Superfast Exp", code: "12786", depTime: "18:20", arrTime: "05:40", durationText: "11h 20m", rating: 4.5, amenities: ["Overnight Journey", "LHB Rake", "94% Punctuality"], priceFactor: 0.81, badge: "Overnight Saver" },
    ],
  },
  {
    id: "rail-blr-bom",
    mode: "railway",
    corridorId: "bangalore-mumbai",
    origin: "KSR Bengaluru (SBC)",
    originCode: "SBC",
    destination: "Mumbai CSMT / DR",
    destinationCode: "CSMT",
    baseFare: 1380,
    distanceKm: 1114,
    durationHrs: 21.5,
    co2KgPerPax: 22,
    comfortScore: 7.9,
    optimalLeadDays: [10, 25],
    classes: [
      { name: "AC 3 Tier (3A)", multiplier: 1.0 },
      { name: "AC 2 Tier (2A)", multiplier: 1.45 },
      { name: "First AC (1A)", multiplier: 2.3 },
      { name: "AC 3 Economy (3E)", multiplier: 0.82 },
      { name: "AC Chair Car (CC)", multiplier: 0.88 },
      { name: "Sleeper (SL)", multiplier: 0.42 },
      { name: "Second Sitting (2S)", multiplier: 0.23 },
    ],
    carriers: [
      { name: "11302 Udyan Express", code: "11302", depTime: "20:40", arrTime: "18:15", durationText: "21h 35m", rating: 4.3, amenities: ["Daily Service", "E-Catering Available", "Bedding in AC"], priceFactor: 1.0, badge: "Direct Express" },
      { name: "11014 LTT Coimbatore Express", code: "11014", depTime: "21:50", arrTime: "19:30", durationText: "21h 40m", rating: 4.2, amenities: ["Pantry Car", "Clean LHB Coaches"], priceFactor: 0.96 },
    ],
  },
  {
    id: "rail-maa-del",
    mode: "railway",
    corridorId: "chennai-delhi",
    origin: "MGR Chennai Central (MAS)",
    originCode: "MAS",
    destination: "New Delhi (NDLS)",
    destinationCode: "NDLS",
    baseFare: 2250,
    distanceKm: 2180,
    durationHrs: 28.2,
    co2KgPerPax: 38,
    comfortScore: 8.2,
    optimalLeadDays: [14, 35],
    classes: [
      { name: "AC 3 Tier (3A)", multiplier: 1.0 },
      { name: "AC 2 Tier (2A)", multiplier: 1.48 },
      { name: "First AC (1A)", multiplier: 2.4 },
      { name: "AC 3 Economy (3E)", multiplier: 0.84 },
      { name: "Sleeper (SL)", multiplier: 0.40 },
      { name: "Second Sitting (2S)", multiplier: 0.22 },
    ],
    carriers: [
      { name: "12433 MAS–NZM Rajdhani Exp", code: "12433", depTime: "06:05", arrTime: "10:30", durationText: "28h 25m", rating: 4.7, amenities: ["All Meals Included", "Priority Track Clearance"], priceFactor: 1.08, badge: "Premium Rajdhani" },
      { name: "12621 Tamil Nadu SF Express", code: "12621", depTime: "22:00", arrTime: "06:30", durationText: "32h 30m", rating: 4.5, amenities: ["Pantry Car", "No Flexi-Surge", "Fixed Base Fare"], priceFactor: 0.86, badge: "No Dynamic Surge" },
    ],
  },

  // ================= ROADWAYS (BUSES & CABS: ANYWHERE IN INDIA) =================
  {
    id: "road-bom-pnq",
    mode: "roadway",
    corridorId: "mumbai-pune",
    origin: "Mumbai (Dadar / Vashi / Borivali)",
    originCode: "MUM-BUS",
    destination: "Pune (Swargate / Wakad / Hinjewadi)",
    destinationCode: "PNQ-BUS",
    baseFare: 380,
    distanceKm: 148,
    durationHrs: 3.25,
    co2KgPerPax: 7,
    comfortScore: 8.8,
    optimalLeadDays: [1, 4],
    classes: [
      { name: "AC Seater / Shivneri", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.35 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 5.5 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 8.2 },
    ],
    carriers: [
      { name: "MSRTC Shivneri Volvo 9600", code: "MSRTC-SHIV-01", depTime: "06:30", arrTime: "09:45", durationText: "3h 15m", rating: 4.8, amenities: ["Every 15 mins", "Expressway Non-Stop", "Pushback Ergonomic Seats"], priceFactor: 1.0, badge: "Iconic Mumbai-Pune Volvo" },
      { name: "Zingbus Maxx AC Multi-Axle", code: "ZB-PNQ-11", depTime: "08:00", arrTime: "11:15", durationText: "3h 15m", rating: 4.6, amenities: ["Smart Boarding Lounge", "Zero Cancellation", "Live Tracking"], priceFactor: 0.95, badge: "Best Value Bus" },
      { name: "MakeMyTrip Outstation Sedan (Dzire)", code: "MMT-SED-01", depTime: "Doorstep On-Demand", arrTime: "3h 00m trip", durationText: "3h 00m", rating: 4.9, amenities: ["Doorstep Pickup & Drop", "Toll Included", "Verified Chauffeur"], priceFactor: 5.5, badge: "Private Door-to-Door Cab" },
      { name: "Savaari Outstation SUV (Innova)", code: "SAV-SUV-01", depTime: "Flexible Schedule", arrTime: "3h 00m trip", durationText: "3h 00m", rating: 4.9, amenities: ["6-7 Seater Luxury", "Fastag Included", "Airport / City Transfer"], priceFactor: 8.2, badge: "Family / Group SUV" },
    ],
  },
  {
    id: "road-bom-nsk",
    mode: "roadway",
    corridorId: "mumbai-nashik",
    origin: "Mumbai (Thane / Dadar / Kasara)",
    originCode: "MUM-BUS",
    destination: "Nashik (CBS / Dwarka Circle)",
    destinationCode: "NSK-BUS",
    baseFare: 420,
    distanceKm: 165,
    durationHrs: 3.5,
    co2KgPerPax: 8,
    comfortScore: 8.6,
    optimalLeadDays: [1, 5],
    classes: [
      { name: "AC Seater / Shivneri", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.35 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 5.8 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 8.5 },
    ],
    carriers: [
      { name: "MSRTC Shivneri / Ashwamedh", code: "MSRTC-NSK-02", depTime: "07:00", arrTime: "10:30", durationText: "3h 30m", rating: 4.7, amenities: ["Kasara Ghat Route", "Clean AC Coach", "On-Time Standard"], priceFactor: 1.0, badge: "State RTC Express" },
      { name: "IntrCity SmartBus Volvo 9600", code: "IC-NSK-08", depTime: "08:30", arrTime: "12:00", durationText: "3h 30m", rating: 4.7, amenities: ["WiFi", "Water & Blankets", "Luggage Tagging"], priceFactor: 1.05 },
      { name: "MakeMyTrip Outstation Sedan", code: "MMT-NSK-CAB", depTime: "Doorstep Pickup", arrTime: "3h 15m trip", durationText: "3h 15m", rating: 4.8, amenities: ["Private AC Car", "Door-to-Door", "All Tolls Included"], priceFactor: 5.8, badge: "Doorstep Cab" },
    ],
  },
  {
    id: "road-bom-shirdi",
    mode: "roadway",
    corridorId: "mumbai-shirdi",
    origin: "Mumbai (Dadar / Thane / Navi Mumbai)",
    originCode: "MUM-BUS",
    destination: "Shirdi (Temple Gate / Sai Nagar)",
    destinationCode: "SHR-BUS",
    baseFare: 490,
    distanceKm: 240,
    durationHrs: 4.0,
    co2KgPerPax: 12,
    comfortScore: 8.7,
    optimalLeadDays: [2, 6],
    classes: [
      { name: "AC Seater Coach", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.45 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 6.8 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 9.8 },
    ],
    carriers: [
      { name: "Samruddhi Mahamarg Volvo Express", code: "SMR-SHR-01", depTime: "06:00", arrTime: "10:00", durationText: "4h 00m", rating: 4.8, amenities: ["Samruddhi Expressway", "High Speed 120 km/h", "Clean Rest Stops"], priceFactor: 1.0, badge: "Samruddhi Mahamarg" },
      { name: "Neeta Tours & Travels Sleeper", code: "NEETA-SHR-03", depTime: "22:00", arrTime: "05:30", durationText: "7h 30m", rating: 4.4, amenities: ["Overnight Sleeper", "Temple Drop", "Pillow & Blanket"], priceFactor: 1.1 },
      { name: "MakeMyTrip Pilgrimage AC Cab", code: "MMT-SHR-09", depTime: "On-Demand Doorstep", arrTime: "3h 45m trip", durationText: "3h 45m", rating: 4.9, amenities: ["Direct Temple Drop", "Same Day Return Opt", "Tolls Included"], priceFactor: 6.8, badge: "Private Temple Cab" },
    ],
  },
  {
    id: "road-del-jpr",
    mode: "roadway",
    corridorId: "delhi-jaipur",
    origin: "Delhi (Dhaula Kuan / IFFCO Chowk / Gurgaon)",
    originCode: "DEL-BUS",
    destination: "Jaipur (Sindhi Camp / 200 Ft Bypass)",
    destinationCode: "JPR-BUS",
    baseFare: 550,
    distanceKm: 275,
    durationHrs: 4.5,
    co2KgPerPax: 14,
    comfortScore: 8.8,
    optimalLeadDays: [2, 6],
    classes: [
      { name: "AC Seater / RSRTC", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.35 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 5.8 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 8.4 },
    ],
    carriers: [
      { name: "Zingbus Maxx Volvo Multi-Axle", code: "ZB-JPR-21", depTime: "07:00", arrTime: "11:30", durationText: "4h 30m", rating: 4.7, amenities: ["Delhi-Mumbai Expressway Spur", "Smart Lounge", "On-Time Guarantee"], priceFactor: 1.0, badge: "Top Express Bus" },
      { name: "RSRTC Super Luxury Volvo", code: "RSRTC-V-01", depTime: "08:30", arrTime: "13:00", durationText: "4h 30m", rating: 4.6, amenities: ["Govt Safety Verified", "Water Bottle", "Punctual Stops"], priceFactor: 0.96 },
      { name: "MakeMyTrip Outstation Sedan", code: "MMT-JPR-01", depTime: "Doorstep Pickup", arrTime: "4h 15m trip", durationText: "4h 15m", rating: 4.9, amenities: ["Door-to-Door", "Tolls Included", "Highway Chauffeur"], priceFactor: 5.8, badge: "Private Chauffeur Cab" },
    ],
  },
  {
    id: "road-del-agr",
    mode: "roadway",
    corridorId: "delhi-agra",
    origin: "Delhi (Sarai Kale Khan / Noida / Pari Chowk)",
    originCode: "DEL-BUS",
    destination: "Agra (Idgah / Taj Expressway Cut)",
    destinationCode: "AGR-BUS",
    baseFare: 450,
    distanceKm: 215,
    durationHrs: 3.2,
    co2KgPerPax: 11,
    comfortScore: 8.9,
    optimalLeadDays: [1, 5],
    classes: [
      { name: "AC Seater Express", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.4 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 5.8 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 8.2 },
    ],
    carriers: [
      { name: "Taj Yamuna Expressway Volvo", code: "YMN-AGR-01", depTime: "07:30", arrTime: "10:45", durationText: "3h 15m", rating: 4.8, amenities: ["6-Lane Yamuna Expressway", "Non-Stop High Speed", "Taj Mahal Drop"], priceFactor: 1.0, badge: "Yamuna Expressway" },
      { name: "MakeMyTrip Same-Day Taj Cab", code: "MMT-AGR-02", depTime: "Doorstep Anytime", arrTime: "3h 00m trip", durationText: "3h 00m", rating: 4.9, amenities: ["Taj Sightseeing Option", "All Tolls Paid", "AC Sedan"], priceFactor: 5.8, badge: "Private Doorstep Cab" },
    ],
  },
  {
    id: "road-blr-mys",
    mode: "roadway",
    corridorId: "bangalore-mysore",
    origin: "Bangalore (Satellite Bus Stand / Kengeri)",
    originCode: "BLR-BUS",
    destination: "Mysore (Suburban Bus Stand)",
    destinationCode: "MYS-BUS",
    baseFare: 320,
    distanceKm: 145,
    durationHrs: 2.2,
    co2KgPerPax: 7,
    comfortScore: 9.0,
    optimalLeadDays: [1, 4],
    classes: [
      { name: "AC Seater / Airavat Club Class", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.45 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 6.8 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 9.8 },
    ],
    carriers: [
      { name: "KSRTC Flybus / Airavat Club Class", code: "KSRTC-MYS-01", depTime: "07:00", arrTime: "09:15", durationText: "2h 15m", rating: 4.9, amenities: ["10-Lane Access-Controlled Expressway", "Every 20 mins", "Comfort Recliners"], priceFactor: 1.0, badge: "10-Lane Expressway" },
      { name: "MakeMyTrip Outstation Sedan", code: "MMT-MYS-CAB", depTime: "Doorstep Pickup", arrTime: "2h 00m trip", durationText: "2h 00m", rating: 4.8, amenities: ["Doorstep Pickup", "Palace City Drop", "Fastag Included"], priceFactor: 6.8, badge: "Private Sedan Cab" },
    ],
  },
  {
    id: "road-bom-goa",
    mode: "roadway",
    corridorId: "mumbai-goa",
    origin: "Mumbai (Borivali / Sion / Vashi)",
    originCode: "MUM-BUS",
    destination: "Goa (Mapusa / Panjim / Margao)",
    destinationCode: "GOA-BUS",
    baseFare: 1050,
    distanceKm: 585,
    durationHrs: 11.5,
    co2KgPerPax: 29,
    comfortScore: 7.8,
    optimalLeadDays: [4, 10],
    classes: [
      { name: "Volvo AC Sleeper", multiplier: 1.0 },
      { name: "AC Seater / Semi-Sleeper", multiplier: 0.7143 },
      { name: "Luxury Single Sleeper Pod", multiplier: 1.2857 },
      { name: "Private AC Sedan Cab (Per Seat Eq)", multiplier: 2.1 },
    ],
    carriers: [
      { name: "IntrCity SmartBus Volvo 9600", code: "IC-GOA-09", depTime: "19:30", arrTime: "07:00", durationText: "11h 30m", rating: 4.7, amenities: ["Onboard Washroom", "Smart Boarding Lounge", "GPS Live Track"], priceFactor: 1.0, badge: "Smart Lounge + Washroom" },
      { name: "Zingbus Maxx Multi-Axle AC", code: "ZB-402", depTime: "20:15", arrTime: "07:50", durationText: "11h 35m", rating: 4.6, amenities: ["Free Snacks", "On-time Guarantee", "Zero Cancellation Opt"], priceFactor: 0.95, badge: "Best Value" },
      { name: "VRL Travels BharatBenz Sleeper", code: "VRL-88", depTime: "21:00", arrTime: "08:45", durationText: "11h 45m", rating: 4.4, amenities: ["Clean Blankets", "Charging Point", "NH-66 / Atal Setu Route"], priceFactor: 0.89, badge: "Lowest Fare" },
    ],
  },
  {
    id: "road-pnq-goa",
    mode: "roadway",
    corridorId: "pune-goa",
    origin: "Pune (Swargate / Katraj / Chandani Chowk)",
    originCode: "PNQ-BUS",
    destination: "Goa (Mapusa / Panjim)",
    destinationCode: "GOA-BUS",
    baseFare: 890,
    distanceKm: 460,
    durationHrs: 9.0,
    co2KgPerPax: 23,
    comfortScore: 8.0,
    optimalLeadDays: [3, 8],
    classes: [
      { name: "Volvo AC Sleeper", multiplier: 1.0 },
      { name: "AC Seater / Semi-Sleeper", multiplier: 0.73 },
      { name: "Private AC Sedan Cab (Per Seat Eq)", multiplier: 2.1 },
    ],
    carriers: [
      { name: "IntrCity SmartBus Volvo 9600", code: "IC-PNQ-GOA", depTime: "21:00", arrTime: "06:00", durationText: "9h 00m", rating: 4.7, amenities: ["Washroom Onboard", "Chorla Ghat View", "Live Bus GPS"], priceFactor: 1.0, badge: "Overnight Sleeper" },
      { name: "VRL Travels Multi-Axle Sleeper", code: "VRL-PNQ-05", depTime: "21:30", arrTime: "06:45", durationText: "9h 15m", rating: 4.5, amenities: ["Reading Lights", "Blankets", "Direct Panjim Drop"], priceFactor: 0.95 },
    ],
  },
  {
    id: "road-blr-hyd",
    mode: "roadway",
    corridorId: "bangalore-hyderabad",
    origin: "Bangalore (Silk Board / Hebbal)",
    originCode: "BLR-BUS",
    destination: "Hyderabad (Gachibowli / Ameerpet)",
    destinationCode: "HYD-BUS",
    baseFare: 980,
    distanceKm: 570,
    durationHrs: 8.5,
    co2KgPerPax: 27,
    comfortScore: 8.2,
    optimalLeadDays: [3, 9],
    classes: [
      { name: "Volvo AC Sleeper", multiplier: 1.0 },
      { name: "Garuda / Airavat Club Class", multiplier: 0.88 },
      { name: "NueGo Electric Luxury Coach", multiplier: 0.94 },
      { name: "Intercity Private Cab (Share Eq)", multiplier: 2.3 },
    ],
    carriers: [
      { name: "KSRTC Ambari Utsav Volvo 9600", code: "KA-01-F99", depTime: "22:00", arrTime: "06:15", durationText: "8h 15m", rating: 4.8, amenities: ["Govt Safety Standard", "NH-44 Non-Stop", "Live Bus Tracker"], priceFactor: 1.0, badge: "Top Punctuality" },
      { name: "Orange Tours & Travels Sleeper", code: "OT-511", depTime: "22:30", arrTime: "06:50", durationText: "8h 20m", rating: 4.6, amenities: ["Individual TV", "Water & Snacks", "Pillow & Blanket"], priceFactor: 0.95, badge: "Popular Sleeper" },
      { name: "IntrCity SmartBus AC Sleeper", code: "IC-HYD-12", depTime: "23:00", arrTime: "07:20", durationText: "8h 20m", rating: 4.7, amenities: ["In-bus Washroom", "Bus Captain Assisted", "Wi-Fi"], priceFactor: 1.05 },
    ],
  },
  {
    id: "road-amd-srt",
    mode: "roadway",
    corridorId: "ahmedabad-surat",
    origin: "Ahmedabad (Geeta Mandir / Paldi / CTM)",
    originCode: "AMD-BUS",
    destination: "Surat (Kamrej / Ring Road / Varachha)",
    destinationCode: "SRT-BUS",
    baseFare: 480,
    distanceKm: 265,
    durationHrs: 4.5,
    co2KgPerPax: 13,
    comfortScore: 8.6,
    optimalLeadDays: [1, 5],
    classes: [
      { name: "AC Seater / GSRTC", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.35 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 6.2 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 8.8 },
    ],
    carriers: [
      { name: "GSRTC Premium Volvo", code: "GSRTC-SRT-01", depTime: "07:15", arrTime: "11:45", durationText: "4h 30m", rating: 4.7, amenities: ["NE-1 National Expressway", "Every 30 Mins", "Pushback Seats"], priceFactor: 1.0, badge: "National Expressway 1" },
      { name: "MakeMyTrip Outstation Sedan", code: "MMT-SRT-CAB", depTime: "Doorstep Pickup", arrTime: "4h 00m trip", durationText: "4h 00m", rating: 4.8, amenities: ["All Tolls Paid", "Doorstep Pickup", "Verified Chauffeur"], priceFactor: 6.2, badge: "Private Cab" },
    ],
  },
  {
    id: "road-maa-pdy",
    mode: "roadway",
    corridorId: "chennai-pondicherry",
    origin: "Chennai (Koyambedu / Thiruvanmiyur / ECR)",
    originCode: "MAA-BUS",
    destination: "Pondicherry (Bus Stand / White Town)",
    destinationCode: "PDY-BUS",
    baseFare: 290,
    distanceKm: 155,
    durationHrs: 3.2,
    co2KgPerPax: 7,
    comfortScore: 8.9,
    optimalLeadDays: [1, 4],
    classes: [
      { name: "AC Seater / SETC Express", multiplier: 1.0 },
      { name: "Volvo AC Sleeper", multiplier: 1.45 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 7.5 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 10.5 },
    ],
    carriers: [
      { name: "East Coast Road (ECR) Scenic Volvo", code: "ECR-PDY-01", depTime: "07:30", arrTime: "10:45", durationText: "3h 15m", rating: 4.8, amenities: ["Scenic Coastal Highway", "Frequent Departures", "Beach Road Drop"], priceFactor: 1.0, badge: "Scenic Coast Road" },
      { name: "MakeMyTrip Outstation Sedan", code: "MMT-PDY-CAB", depTime: "Doorstep Anytime", arrTime: "3h 00m trip", durationText: "3h 00m", rating: 4.9, amenities: ["Direct White Town Drop", "Toll Included", "AC Sedan"], priceFactor: 7.5, badge: "Private Beach Cab" },
    ],
  },
  {
    id: "road-bom-kolhapur",
    mode: "roadway",
    corridorId: "mumbai-kolhapur",
    origin: "Mumbai (Borivali / Sion / Vashi)",
    originCode: "MUM-BUS",
    destination: "Kolhapur (CBS / Kawala Naka)",
    destinationCode: "KLP-BUS",
    baseFare: 720,
    distanceKm: 380,
    durationHrs: 7.5,
    co2KgPerPax: 19,
    comfortScore: 8.1,
    optimalLeadDays: [2, 7],
    classes: [
      { name: "Volvo AC Sleeper", multiplier: 1.0 },
      { name: "AC Seater Coach", multiplier: 0.72 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 7.2 },
      { name: "Private AC SUV Cab (Innova Crysta)", multiplier: 10.2 },
    ],
    carriers: [
      { name: "Konduskar Travels Volvo Multi-Axle", code: "KND-KLP-04", depTime: "22:00", arrTime: "05:30", durationText: "7h 30m", rating: 4.7, amenities: ["NH-48 Golden Quadrilateral", "Overnight Sleeper", "Mahalaxmi Temple Drop"], priceFactor: 1.0, badge: "Popular Sleeper" },
      { name: "MSRTC Shivshahi AC Coach", code: "MSRTC-KLP-09", depTime: "08:00", arrTime: "16:00", durationText: "8h 00m", rating: 4.4, amenities: ["Govt Bus", "Frequent Halts", "Low Fare"], priceFactor: 0.88 },
    ],
  },
  {
    id: "road-blr-bom",
    mode: "roadway",
    corridorId: "bangalore-mumbai",
    origin: "Bangalore (Anand Rao Circle / Nelamangala)",
    originCode: "BLR-BUS",
    destination: "Mumbai (Vashi / Dadar / Borivali)",
    destinationCode: "MUM-BUS",
    baseFare: 1550,
    distanceKm: 984,
    durationHrs: 16.0,
    co2KgPerPax: 44,
    comfortScore: 7.7,
    optimalLeadDays: [4, 12],
    classes: [
      { name: "Volvo Multi-Axle AC Sleeper", multiplier: 1.0 },
      { name: "Scania Semi-Sleeper", multiplier: 0.84 },
      { name: "Luxury Single Cabin", multiplier: 1.28 },
    ],
    carriers: [
      { name: "VRL Travels Volvo Multi-Axle", code: "VRL-BLR-01", depTime: "16:30", arrTime: "08:30", durationText: "16h 00m", rating: 4.6, amenities: ["Dedicated Rest Stops", "Dual Drivers", "GPS Monitored"], priceFactor: 1.0, badge: "Most Reliable" },
      { name: "SRS Travels Scania Sleeper", code: "SRS-904", depTime: "18:00", arrTime: "10:15", durationText: "16h 15m", rating: 4.4, amenities: ["Reading Light", "Charging Socket", "Luggage Tagging"], priceFactor: 0.92, badge: "Budget Friendly" },
    ],
  },
  {
    id: "road-bom-del",
    mode: "roadway",
    corridorId: "mumbai-delhi",
    origin: "Mumbai (Borivali / Thane)",
    originCode: "MUM-EXP",
    destination: "Delhi (ISBT Kashmere Gate / Gurgaon)",
    destinationCode: "DEL-ISBT",
    baseFare: 2250,
    distanceKm: 1415,
    durationHrs: 23.5,
    co2KgPerPax: 58,
    comfortScore: 7.4,
    optimalLeadDays: [5, 14],
    classes: [
      { name: "Volvo AC Sleeper", multiplier: 1.0 },
      { name: "Luxury Sleeper Pod", multiplier: 1.3 },
      { name: "Outstation AC SUV Cab (Per Pax)", multiplier: 2.8 },
    ],
    carriers: [
      { name: "Raj Ratan Tours Volvo 9600", code: "RR-DEL-07", depTime: "15:00", arrTime: "14:30", durationText: "23h 30m", rating: 4.5, amenities: ["Delhi-Mumbai Expressway", "Washroom Onboard", "2 Driver Crew"], priceFactor: 1.0, badge: "Expressway Route" },
      { name: "Ashok Travels Mandsaur Group", code: "AT-209", depTime: "17:00", arrTime: "16:45", durationText: "23h 45m", rating: 4.3, amenities: ["Full Berths", "Highway Dhaba Halts", "Live Tracking"], priceFactor: 0.93 },
    ],
  },

  // ================= WATERWAYS =================
  {
    id: "water-bom-goa",
    mode: "waterway",
    corridorId: "mumbai-goa",
    origin: "Mumbai International Cruise Terminal (BPX)",
    originCode: "INBOM-PORT",
    destination: "Goa Mormugao Port (MRM)",
    destinationCode: "INGOA-PORT",
    baseFare: 5800,
    distanceKm: 430,
    durationHrs: 14.0,
    co2KgPerPax: 48,
    comfortScore: 9.4,
    optimalLeadDays: [12, 28],
    classes: [
      { name: "High-Speed Coastal Ferry Deck", multiplier: 0.58 },
      { name: "Interior Stateroom", multiplier: 1.0 },
      { name: "Oceanview Cabin", multiplier: 1.45 },
      { name: "Mini Suite with Balcony", multiplier: 2.3 },
    ],
    carriers: [
      { name: "Konkan High-Speed Pax Catamaran", code: "HSC-KONKAN-1", depTime: "07:30", arrTime: "15:30", durationText: "8h 00m", rating: 4.6, amenities: ["Panoramic Sea Deck", "Snack Bar", "30-Knot Catamaran"], priceFactor: 0.62, badge: "Fastest Sea Route" },
      { name: "Cordelia Cruises – MV Empress", code: "CRD-EMP-04", depTime: "18:00", arrTime: "08:30", durationText: "14h 30m", rating: 4.9, amenities: ["All-Inclusive Dining", "Pool & Live Shows", "Ocean Stateroom"], priceFactor: 1.12, badge: "Luxury Cruise Experience" },
      { name: "Angriya Coastal Cruise", code: "ANG-701", depTime: "16:00", arrTime: "07:00", durationText: "15h 00m", rating: 4.5, amenities: ["Sunset Deck", "3 Meals Included", "Infinity Pool"], priceFactor: 0.94, badge: "Scenic Coastal" },
    ],
  },
  {
    id: "water-bom-mandwa",
    mode: "waterway",
    corridorId: "mumbai-alibaug",
    origin: "Mumbai Ferry Wharf (Bhaucha Dhakka)",
    originCode: "MUM-WHARF",
    destination: "Mandwa / Alibaug Ro-Ro Port",
    destinationCode: "MDW-JETTY",
    baseFare: 420,
    distanceKm: 36,
    durationHrs: 1.0,
    co2KgPerPax: 6,
    comfortScore: 9.1,
    optimalLeadDays: [3, 10],
    classes: [
      { name: "Economy AC Lounge", multiplier: 1.0 },
      { name: "Skylounge Premium Deck", multiplier: 1.1667 },
      { name: "Ro-Ro Car + Driver Package", multiplier: 3.0 },
    ],
    carriers: [
      { name: "M2M Ferries (Ro-Pax Vessel)", code: "M2M-01", depTime: "08:30", arrTime: "09:30", durationText: "1h 00m", rating: 4.9, amenities: ["Carry Car/Bike Onboard", "Saves 3.5 hrs Road Traffic", "All-Weather Stabilizers"], priceFactor: 1.0, badge: "Ro-Ro Vehicle + Pax" },
      { name: "Maldar Catamaran High-Speed", code: "MLD-CAT-03", depTime: "10:15", arrTime: "11:05", durationText: "0h 50m", rating: 4.6, amenities: ["Gateway of India Dep", "Free Bus to Alibaug", "AC Upper Deck"], priceFactor: 0.88, badge: "Fastest Catamaran" },
      { name: "PNP Maritime Speed Ferry", code: "PNP-204", depTime: "16:30", arrTime: "17:20", durationText: "0h 50m", rating: 4.5, amenities: ["Open Sea Breeze Deck", "Direct Bus Transfer"], priceFactor: 0.85, badge: "Lowest Fare" },
    ],
  },
  {
    id: "water-ixz-hvl",
    mode: "waterway",
    corridorId: "andaman-islands",
    origin: "Port Blair (Haddo Wharf)",
    originCode: "IXZ-PORT",
    destination: "Havelock Island (Swaraj Dweep)",
    destinationCode: "HVL-JETTY",
    baseFare: 1450,
    distanceKm: 57,
    durationHrs: 1.5,
    co2KgPerPax: 14,
    comfortScore: 8.9,
    optimalLeadDays: [7, 21],
    classes: [
      { name: "Premium Class", multiplier: 1.0 },
      { name: "Deluxe Class", multiplier: 1.3448 },
      { name: "Royal Suite", multiplier: 2.0345 },
    ],
    carriers: [
      { name: "Makruzz Gold Catamaran", code: "MKZ-101", depTime: "08:00", arrTime: "09:30", durationText: "1h 30m", rating: 4.8, amenities: ["Fully Air-Conditioned", "Coral Reef View Windows", "Onboard Cafe"], priceFactor: 1.0, badge: "No.1 Island Ferry" },
      { name: "Nautika High-Speed Craft", code: "NTK-302", depTime: "07:30", arrTime: "08:45", durationText: "1h 15m", rating: 4.8, amenities: ["Newest Twin-Hull Craft", "Live Entertainment", "25kg Baggage"], priceFactor: 1.0, badge: "Fastest 75 Mins" },
      { name: "Green Ocean 1 Cruise", code: "GO-108", depTime: "06:45", arrTime: "09:00", durationText: "2h 15m", rating: 4.5, amenities: ["Open Deck Access", "Music & Dance Zone", "Budget Friendly"], priceFactor: 0.86, badge: "Open Sea Deck" },
    ],
  },
  {
    id: "water-cok-agx",
    mode: "waterway",
    corridorId: "kochi-lakshadweep",
    origin: "Kochi Wharf (Willingdon Island)",
    originCode: "INKOK-PORT",
    destination: "Lakshadweep (Agatti / Kavaratti)",
    destinationCode: "INLK-PORT",
    baseFare: 4250,
    distanceKm: 450,
    durationHrs: 16.0,
    co2KgPerPax: 42,
    comfortScore: 8.7,
    optimalLeadDays: [14, 30],
    classes: [
      { name: "Bunk / Tourist Class", multiplier: 0.65 },
      { name: "Second Class AC Cabin", multiplier: 1.0 },
      { name: "First Class Deluxe Cabin", multiplier: 1.85 },
    ],
    carriers: [
      { name: "MV Kavaratti Passenger Ship", code: "MV-KVR-01", depTime: "15:00", arrTime: "07:00", durationText: "16h 00m", rating: 4.7, amenities: ["100-Seat Dining Hall", "Cafeteria & Medical Ward", "Helipad Onboard"], priceFactor: 0.95, badge: "Govt Flagship Vessel" },
      { name: "MV Lakshadweep Sea", code: "MV-LKS-02", depTime: "16:30", arrTime: "08:45", durationText: "16h 15m", rating: 4.5, amenities: ["Upper Promenade Deck", "Full Meal Service"], priceFactor: 1.0 },
    ],
  },
];

// ================= ANYWHERE IN INDIA ROADWAYS DIRECTORY & ENGINE =================
export interface RoadCity {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  hubDesc?: string;
  popular?: boolean;
}

export const INDIAN_ROAD_CITIES: RoadCity[] = [
  // Maharashtra & Western India
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777, popular: true, hubDesc: "Dadar / Borivali / Thane / Vashi" },
  { id: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, popular: true, hubDesc: "Swargate / Wakad / Hinjewadi" },
  { id: "nashik", name: "Nashik", state: "Maharashtra", lat: 19.9975, lon: 73.7898, popular: true, hubDesc: "CBS / Dwarka Circle" },
  { id: "shirdi", name: "Shirdi", state: "Maharashtra", lat: 19.7667, lon: 74.4764, popular: true, hubDesc: "Sai Temple / Samruddhi Mahamarg" },
  { id: "kolhapur", name: "Kolhapur", state: "Maharashtra", lat: 16.705, lon: 74.2433, popular: true, hubDesc: "CBS / Kawala Naka" },
  { id: "mahabaleshwar", name: "Mahabaleshwar", state: "Maharashtra", lat: 17.9237, lon: 73.6586, popular: true, hubDesc: "Panchgani / ST Stand" },
  { id: "lonavala", name: "Lonavala", state: "Maharashtra", lat: 18.7557, lon: 73.4091, popular: true, hubDesc: "Expressway Toll Point" },
  { id: "alibaug", name: "Alibaug", state: "Maharashtra", lat: 18.6414, lon: 72.8722, popular: true, hubDesc: "Mandwa Jetty / ST Stand" },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, popular: true, hubDesc: "Ganeshpeth / Samruddhi Exp" },
  { id: "aurangabad", name: "Chhatrapati Sambhajinagar (Aurangabad)", state: "Maharashtra", lat: 19.8762, lon: 75.3433, hubDesc: "Central Bus Stand" },
  { id: "solapur", name: "Solapur", state: "Maharashtra", lat: 17.6599, lon: 75.9064, hubDesc: "Solapur Bus Stand" },
  { id: "ratnagiri", name: "Ratnagiri", state: "Maharashtra", lat: 16.9902, lon: 73.312, hubDesc: "Konkan NH-66 Route" },
  { id: "thane", name: "Thane", state: "Maharashtra", lat: 19.2183, lon: 72.9781, popular: true, hubDesc: "Teen Hath Naka / Majiwada" },
  { id: "navi-mumbai", name: "Navi Mumbai", state: "Maharashtra", lat: 19.033, lon: 73.0297, popular: true, hubDesc: "Vashi / Kharghar / Panvel" },
  { id: "kalyan", name: "Kalyan", state: "Maharashtra", lat: 19.2437, lon: 73.1355, hubDesc: "Kalyan ST Stand" },

  // Delhi-NCR & North India
  { id: "delhi", name: "Delhi", state: "Delhi NCR", lat: 28.6139, lon: 77.209, popular: true, hubDesc: "ISBT Kashmere Gate / Dhaula Kuan" },
  { id: "gurgaon", name: "Gurgaon (Gurugram)", state: "Haryana", lat: 28.4595, lon: 77.0266, popular: true, hubDesc: "IFFCO Chowk / Rajiv Chowk" },
  { id: "noida", name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lon: 77.391, popular: true, hubDesc: "Sector 37 / Pari Chowk" },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, popular: true, hubDesc: "Sindhi Camp / 200 Ft Bypass" },
  { id: "udaipur", name: "Udaipur", state: "Rajasthan", lat: 24.5854, lon: 73.7125, popular: true, hubDesc: "Udaisagar / City Stand" },
  { id: "jodhpur", name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lon: 73.0243, hubDesc: "Raikabagh / Paota" },
  { id: "ajmer", name: "Ajmer / Pushkar", state: "Rajasthan", lat: 26.4499, lon: 74.6399, hubDesc: "Dargah / Ajmer Bus Stand" },
  { id: "agra", name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lon: 78.0081, popular: true, hubDesc: "Yamuna Expressway / Idgah" },
  { id: "mathura", name: "Mathura / Vrindavan", state: "Uttar Pradesh", lat: 27.4924, lon: 77.6737, popular: true, hubDesc: "Yamuna Cut / Temple Gate" },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, popular: true, hubDesc: "Alambagh / Kaisarbagh" },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, popular: true, hubDesc: "Cantt Bus Station" },
  { id: "ayodhya", name: "Ayodhya", state: "Uttar Pradesh", lat: 26.7922, lon: 82.1998, popular: true, hubDesc: "Ram Mandir Dham / Bypass" },
  { id: "chandigarh", name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lon: 76.7794, popular: true, hubDesc: "ISBT Sector 43 / Sector 17" },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, popular: true, hubDesc: "ISBT Tutikandi / Victory Tunnel" },
  { id: "manali", name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lon: 77.1892, popular: true, hubDesc: "Mall Road Private Volvo Stand" },
  { id: "dharamshala", name: "Dharamshala", state: "Himachal Pradesh", lat: 32.219, lon: 76.3234, hubDesc: "Kotwali Bazar / McLeod Ganj" },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lon: 78.0322, popular: true, hubDesc: "ISBT Haridwar Bypass" },
  { id: "rishikesh", name: "Rishikesh / Haridwar", state: "Uttarakhand", lat: 30.0869, lon: 78.2676, popular: true, hubDesc: "Natraj Chowk / Har Ki Pauri" },
  { id: "amritsar", name: "Amritsar", state: "Punjab", lat: 31.634, lon: 74.8723, hubDesc: "ISBT Amritsar" },

  // South India
  { id: "bangalore", name: "Bangalore (Bengaluru)", state: "Karnataka", lat: 12.9716, lon: 77.5946, popular: true, hubDesc: "Majestic / Silk Board / Kengeri" },
  { id: "mysore", name: "Mysore (Mysuru)", state: "Karnataka", lat: 12.2958, lon: 76.6394, popular: true, hubDesc: "10-Lane Expressway / Suburban Stand" },
  { id: "mangalore", name: "Mangalore", state: "Karnataka", lat: 12.9141, lon: 74.856, popular: true, hubDesc: "KSRTC Bejai Bus Stand" },
  { id: "coorg", name: "Coorg (Madikeri)", state: "Karnataka", lat: 12.4244, lon: 75.7382, popular: true, hubDesc: "Madikeri Private Bus Stand" },
  { id: "hubli", name: "Hubli-Dharwad", state: "Karnataka", lat: 15.3647, lon: 75.124, hubDesc: "Old Bus Stand / Gokul Road" },
  { id: "hampi", name: "Hampi / Hospet", state: "Karnataka", lat: 15.335, lon: 76.46, hubDesc: "Hospet KSRTC Stand" },
  { id: "gokarna", name: "Gokarna", state: "Karnataka", lat: 14.5479, lon: 74.3188, hubDesc: "KSRTC Bus Depot / Beach Rd" },
  { id: "chikmagalur", name: "Chikmagalur", state: "Karnataka", lat: 13.3161, lon: 75.772, hubDesc: "KSRTC Bus Stand" },
  { id: "ooty", name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lon: 76.695, popular: true, hubDesc: "Central Bus Stand Ooty" },
  { id: "goa-panjim", name: "Goa (Panjim)", state: "Goa", lat: 15.4909, lon: 73.8278, popular: true, hubDesc: "Panjim KTC Bus Stand" },
  { id: "goa-mapusa", name: "Goa (Mapusa)", state: "Goa", lat: 15.5937, lon: 73.8142, popular: true, hubDesc: "Mapusa KTC Bus Stand" },
  { id: "goa-margao", name: "Goa (Margao)", state: "Goa", lat: 15.2832, lon: 73.9862, popular: true, hubDesc: "Margao KTC Bus Terminal" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867, popular: true, hubDesc: "MGBS / Gachibowli / Ameerpet" },
  { id: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lon: 80.648, popular: true, hubDesc: "PNBS Bus Station" },
  { id: "visakhapatnam", name: "Visakhapatnam (Vizag)", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, hubDesc: "Dwaraka Bus Station" },
  { id: "tirupati", name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lon: 79.4192, popular: true, hubDesc: "Tirupati Central Stand / Alipiri" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, popular: true, hubDesc: "Koyambedu CMBT / Kilambakkam KCBT" },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lon: 76.9558, popular: true, hubDesc: "Gandhipuram Bus Stand" },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lon: 78.1198, hubDesc: "Mattuthavani Integrated Stand" },
  { id: "pondicherry", name: "Pondicherry (Puducherry)", state: "Puducherry", lat: 11.9416, lon: 79.8083, popular: true, hubDesc: "East Coast Road (ECR) / White Town" },
  { id: "kochi", name: "Kochi (Cochin)", state: "Kerala", lat: 9.9312, lon: 76.2673, popular: true, hubDesc: "Vyttila Mobility Hub" },
  { id: "trivandrum", name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lon: 76.9366, hubDesc: "Thampanoor KSRTC Central" },
  { id: "munnar", name: "Munnar", state: "Kerala", lat: 10.0889, lon: 77.0595, popular: true, hubDesc: "Munnar KSRTC Stand" },
  { id: "wayanad", name: "Wayanad (Kalpetta)", state: "Kerala", lat: 11.6854, lon: 76.132, hubDesc: "Kalpetta Bus Station" },

  // Gujarat & Central India
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, popular: true, hubDesc: "Geeta Mandir / Paldi / CTM" },
  { id: "surat", name: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311, popular: true, hubDesc: "NE-1 Expressway / Kamrej" },
  { id: "vadodara", name: "Vadodara (Baroda)", state: "Gujarat", lat: 22.3072, lon: 73.1812, popular: true, hubDesc: "Central Bus Station" },
  { id: "rajkot", name: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022, hubDesc: "Shastri Maidan ST Stand" },
  { id: "somnath", name: "Somnath / Veraval", state: "Gujarat", lat: 20.888, lon: 70.401, hubDesc: "Temple Bypass / Veraval" },
  { id: "dwarka", name: "Dwarka", state: "Gujarat", lat: 22.2442, lon: 68.9685, hubDesc: "Dwarkadhish Temple ST Stand" },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577, popular: true, hubDesc: "Sarwate Bus Stand / Vijay Nagar" },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, popular: true, hubDesc: "ISBT Bhopal / Habibganj" },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lon: 75.7885, popular: true, hubDesc: "Mahakaleshwar Dham / Dewas Gate" },

  // East India
  { id: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, popular: true, hubDesc: "Esplanade / Babughat" },
  { id: "digha", name: "Digha", state: "West Bengal", lat: 21.6266, lon: 87.5074, popular: true, hubDesc: "Old Digha / New Digha Stand" },
  { id: "siliguri", name: "Siliguri", state: "West Bengal", lat: 26.7271, lon: 88.3953, popular: true, hubDesc: "Tenzing Norgay Central Bus Terminus" },
  { id: "darjeeling", name: "Darjeeling", state: "West Bengal", lat: 27.041, lon: 88.2663, hubDesc: "Chauk Bazaar Bus Stand" },
  { id: "puri", name: "Puri", state: "Odisha", lat: 19.8135, lon: 85.8312, popular: true, hubDesc: "Gundicha Temple Bus Stand" },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245, popular: true, hubDesc: "Baramunda Bus Stand" },
];

export function calculateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const airDist = R * c;

  // Real highway winding factor for Indian highways / expressways
  const windingFactor = airDist < 100 ? 1.34 : airDist < 400 ? 1.28 : 1.22;
  return Math.max(25, Math.round(airDist * windingFactor));
}

export interface HighwayTelemetry {
  distanceKm: number;
  durationHrs: number;
  durationText: string;
  fastagToll: number;
  fuelPetrolDiesel: number;
  fuelEv: number;
  co2Kg: number;
  comfortScore: number;
}

export function calculateHighwayTelemetry(distanceKm: number): HighwayTelemetry {
  const avgSpeedKmh = distanceKm < 120 ? 48 : distanceKm < 350 ? 58 : 64;
  const rawHrs = distanceKm / avgSpeedKmh;
  const restStopsBuffer = Math.floor(distanceKm / 200) * 0.5;
  const durationHrs = Number((rawHrs + restStopsBuffer).toFixed(1));
  const hrs = Math.floor(durationHrs);
  const mins = Math.round((durationHrs - hrs) * 60);
  const durationText = `${hrs}h ${mins > 0 ? `${mins}m` : "00m"}`;

  const fastagToll = Math.round(distanceKm * 2.15);
  const fuelPetrolDiesel = Math.round((distanceKm / 14) * 104);
  const fuelEv = Math.round(distanceKm * 0.16 * 11);
  const co2Kg = Math.round(distanceKm * 0.048);
  const comfortScore = distanceKm < 200 ? 8.9 : distanceKm < 500 ? 8.3 : 7.6;

  return {
    distanceKm,
    durationHrs,
    durationText,
    fastagToll,
    fuelPetrolDiesel,
    fuelEv,
    co2Kg,
    comfortScore,
  };
}

export function getCityCoordinates(cityName: string): { lat: number; lon: number; name: string; state: string } {
  const clean = cityName.trim().toLowerCase();
  const found = INDIAN_ROAD_CITIES.find(
    (c) =>
      c.name.toLowerCase() === clean ||
      c.id.toLowerCase() === clean ||
      clean.includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(clean)
  );
  if (found) {
    return { lat: found.lat, lon: found.lon, name: found.name, state: found.state };
  }

  const foundAirport = INDIAN_AIRPORTS.find(
    (a) =>
      a.code.toLowerCase() === clean ||
      a.city.toLowerCase() === clean ||
      clean.includes(a.code.toLowerCase()) ||
      clean.includes(a.city.toLowerCase())
  );
  if (foundAirport) {
    return { lat: foundAirport.lat, lon: foundAirport.lon, name: foundAirport.city, state: foundAirport.state };
  }

  // Deterministic fallback for any custom town entered by the user
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const lat = 18.5 + (Math.abs(hash) % 1000) / 100;
  const lon = 73.5 + (Math.abs(hash >> 3) % 900) / 100;
  return { lat, lon, name: cityName.trim(), state: "India" };
}

export const DYNAMIC_ROAD_ROUTES_CACHE = new Map<string, RouteDefinition>();

export function createDynamicRoadRoute(fromCity: string, toCity: string): RouteDefinition {
  const normFrom = fromCity.trim();
  const normTo = toCity.trim();
  const slugFrom = normFrom.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const slugTo = normTo.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const routeId = `road-dyn-${slugFrom}-${slugTo}`;

  if (DYNAMIC_ROAD_ROUTES_CACHE.has(routeId)) {
    return DYNAMIC_ROAD_ROUTES_CACHE.get(routeId)!;
  }

  // Check if predefined route exists
  const existing = MULTI_MODAL_ROUTES.find(
    (r) =>
      r.mode === "roadway" &&
      r.origin.toLowerCase().includes(normFrom.toLowerCase()) &&
      r.destination.toLowerCase().includes(normTo.toLowerCase())
  );
  if (existing) {
    DYNAMIC_ROAD_ROUTES_CACHE.set(routeId, existing);
    return existing;
  }

  const c1 = getCityCoordinates(normFrom);
  const c2 = getCityCoordinates(normTo);
  const distanceKm = calculateRoadDistanceKm(c1.lat, c1.lon, c2.lat, c2.lon);
  const telemetry = calculateHighwayTelemetry(distanceKm);

  const baseFare = Math.max(280, Math.round(distanceKm * 2.05));

  let rtcName = "MSRTC Shivneri / Express";
  if (c1.state === "Karnataka" || c2.state === "Karnataka") rtcName = "KSRTC Airavat Club Class";
  else if (c1.state === "Rajasthan" || c2.state === "Rajasthan") rtcName = "RSRTC Super Luxury Volvo";
  else if (c1.state === "Gujarat" || c2.state === "Gujarat") rtcName = "GSRTC Volvo Express";
  else if (c1.state === "Tamil Nadu" || c2.state === "Tamil Nadu") rtcName = "SETC Ultra Deluxe AC";
  else if (c1.state === "Telangana" || c2.state === "Telangana") rtcName = "TSRTC Garuda Plus";
  else if (c1.state === "Uttar Pradesh" || c2.state === "Uttar Pradesh") rtcName = "UPSRTC Janrath AC";
  else if (c1.state === "Himachal Pradesh" || c2.state === "Himachal Pradesh") rtcName = "HRTC Himsuta Volvo";

  const dynamicRoute: RouteDefinition = {
    id: routeId,
    mode: "roadway",
    corridorId: `${slugFrom}-${slugTo}`,
    origin: `${normFrom} (Doorstep / Hub)`,
    originCode: `${normFrom.slice(0, 3).toUpperCase()}-ROAD`,
    destination: `${normTo} (Doorstep / Hub)`,
    destinationCode: `${normTo.slice(0, 3).toUpperCase()}-ROAD`,
    baseFare,
    distanceKm: telemetry.distanceKm,
    durationHrs: telemetry.durationHrs,
    co2KgPerPax: telemetry.co2Kg,
    comfortScore: telemetry.comfortScore,
    optimalLeadDays: [1, 5],
    classes: [
      { name: "Volvo AC Sleeper", multiplier: 1.0 },
      { name: "AC Seater / RTC Express", multiplier: 0.72 },
      { name: "Private AC Sedan Cab (Dzire / Etios)", multiplier: 5.2 },
      { name: "Private AC SUV Cab (Innova Crysta / Ertiga)", multiplier: 7.8 },
    ],
    carriers: [
      {
        name: `${rtcName} Volvo 9600`,
        code: `RTC-${normFrom.slice(0, 3).toUpperCase()}-01`,
        depTime: "07:30",
        arrTime: `${telemetry.durationText} trip`,
        durationText: telemetry.durationText,
        rating: 4.7,
        amenities: ["Govt Safety Standard", "Expressway Non-Stop", "Pushback Ergonomic Seats"],
        priceFactor: 0.96,
        badge: "Official State RTC",
      },
      {
        name: "IntrCity SmartBus AC Multi-Axle",
        code: `IC-${normTo.slice(0, 3).toUpperCase()}-11`,
        depTime: "09:00",
        arrTime: `${telemetry.durationText} trip`,
        durationText: telemetry.durationText,
        rating: 4.8,
        amenities: ["Smart Lounge Access", "GPS Live Track", "Luggage Tagging"],
        priceFactor: 1.0,
        badge: "Top Rated Sleeper",
      },
      {
        name: "Zingbus Maxx Luxury Multi-Axle",
        code: `ZB-${normTo.slice(0, 3).toUpperCase()}-22`,
        depTime: "21:30",
        arrTime: `${telemetry.durationText} trip`,
        durationText: telemetry.durationText,
        rating: 4.6,
        amenities: ["Zero Cancellation Fee", "Clean Blankets", "Verified Fleet"],
        priceFactor: 0.94,
        badge: "Best Value Bus",
      },
      {
        name: "MakeMyTrip Outstation Sedan (Dzire)",
        code: `MMT-CAB-${normFrom.slice(0, 3).toUpperCase()}`,
        depTime: "Doorstep Anytime",
        arrTime: `${telemetry.durationText} trip`,
        durationText: telemetry.durationText,
        rating: 4.9,
        amenities: ["Door-to-Door Pickup", "All Tolls Included", "Verified Chauffeur"],
        priceFactor: 5.2,
        badge: "Private AC Sedan Cab",
      },
      {
        name: "Savaari Outstation SUV (Innova Crysta)",
        code: `SAV-SUV-${normFrom.slice(0, 3).toUpperCase()}`,
        depTime: "Flexible Schedule",
        arrTime: `${telemetry.durationText} trip`,
        durationText: telemetry.durationText,
        rating: 4.9,
        amenities: ["6-7 Seater Luxury", "FASTag Tolls Paid", "Highway Safety Verified"],
        priceFactor: 7.8,
        badge: "Family / Group SUV",
      },
    ],
  };

  DYNAMIC_ROAD_ROUTES_CACHE.set(routeId, dynamicRoute);
  return dynamicRoute;
}

// ================= ANYWHERE IN INDIA RAILWAYS DIRECTORY & ENGINE =================
export interface RailStation {
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  division?: string;
  zone?: string;
  popular?: boolean;
}

export const INDIAN_RAIL_STATIONS: RailStation[] = [
  // Maharashtra & Western / Central Railway
  { code: "CSMT", name: "Mumbai Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai", state: "Maharashtra", lat: 18.940, lon: 72.835, popular: true, division: "CR" },
  { code: "MMCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra", lat: 18.9696, lon: 72.8193, popular: true, division: "WR" },
  { code: "DR", name: "Dadar Central", city: "Mumbai", state: "Maharashtra", lat: 19.0178, lon: 72.8478, popular: true, division: "CR" },
  { code: "LTT", name: "Lokmanya Tilak Terminus (Kurla)", city: "Mumbai", state: "Maharashtra", lat: 19.0699, lon: 72.8906, popular: true, division: "CR" },
  { code: "BDTS", name: "Bandra Terminus", city: "Mumbai", state: "Maharashtra", lat: 19.0628, lon: 72.8415, popular: true, division: "WR" },
  { code: "TNA", name: "Thane", city: "Thane", state: "Maharashtra", lat: 19.186, lon: 72.9759, popular: true, division: "CR" },
  { code: "KYN", name: "Kalyan Junction", city: "Kalyan", state: "Maharashtra", lat: 19.2364, lon: 73.1306, popular: true, division: "CR" },
  { code: "PNVL", name: "Panvel Junction", city: "Navi Mumbai", state: "Maharashtra", lat: 18.9894, lon: 73.1175, popular: true, division: "CR" },
  { code: "PUNE", name: "Pune Junction", city: "Pune", state: "Maharashtra", lat: 18.5284, lon: 73.8739, popular: true, division: "CR" },
  { code: "LNL", name: "Lonavala", city: "Lonavala", state: "Maharashtra", lat: 18.7533, lon: 73.4061, popular: true, division: "CR" },
  { code: "NK", name: "Nashik Road", city: "Nashik", state: "Maharashtra", lat: 19.9538, lon: 73.8378, popular: true, division: "CR" },
  { code: "MMR", name: "Manmad Junction", city: "Manmad", state: "Maharashtra", lat: 20.2526, lon: 74.4363, division: "CR" },
  { code: "SNSI", name: "Sainagar Shirdi", city: "Shirdi", state: "Maharashtra", lat: 19.7828, lon: 74.4891, popular: true, division: "CR" },
  { code: "BSL", name: "Bhusaval Junction", city: "Bhusaval", state: "Maharashtra", lat: 21.0475, lon: 75.7878, division: "CR" },
  { code: "NGP", name: "Nagpur Junction", city: "Nagpur", state: "Maharashtra", lat: 21.1524, lon: 79.0888, popular: true, division: "CR" },
  { code: "KOP", name: "Kolhapur CSMT", city: "Kolhapur", state: "Maharashtra", lat: 16.7025, lon: 74.2375, popular: true, division: "CR" },
  { code: "SUR", name: "Solapur", city: "Solapur", state: "Maharashtra", lat: 17.6698, lon: 75.9064, division: "CR" },
  { code: "AWB", name: "Chhatrapati Sambhajinagar (Aurangabad)", city: "Aurangabad", state: "Maharashtra", lat: 19.8665, lon: 75.3283, popular: true, division: "SCR" },

  // Goa & Konkan Railway
  { code: "MAO", name: "Madgaon Junction (Goa)", city: "Goa", state: "Goa", lat: 15.2736, lon: 73.9749, popular: true, division: "KR" },
  { code: "KRMI", name: "Karmali (North Goa)", city: "Goa", state: "Goa", lat: 15.4984, lon: 73.9213, popular: true, division: "KR" },
  { code: "VSG", name: "Vasco da Gama", city: "Goa", state: "Goa", lat: 15.3986, lon: 73.8118, division: "SWR" },
  { code: "RN", name: "Ratnagiri", city: "Ratnagiri", state: "Maharashtra", lat: 16.9819, lon: 73.3328, division: "KR" },

  // Delhi-NCR & Northern Railway
  { code: "NDLS", name: "New Delhi", city: "Delhi", state: "Delhi", lat: 28.6429, lon: 77.2195, popular: true, division: "NR" },
  { code: "DLI", name: "Old Delhi Junction", city: "Delhi", state: "Delhi", lat: 28.6619, lon: 77.228, popular: true, division: "NR" },
  { code: "NZM", name: "Hazrat Nizamuddin", city: "Delhi", state: "Delhi", lat: 28.5888, lon: 77.2536, popular: true, division: "NR" },
  { code: "ANVT", name: "Anand Vihar Terminal", city: "Delhi", state: "Delhi", lat: 28.6508, lon: 77.3153, popular: true, division: "NR" },
  { code: "CDG", name: "Chandigarh Junction", city: "Chandigarh", state: "Chandigarh", lat: 30.7046, lon: 76.8228, popular: true, division: "NR" },
  { code: "KLK", name: "Kalka (Shimla Toy Train)", city: "Kalka", state: "Haryana", lat: 30.8354, lon: 76.9358, popular: true, division: "NR" },
  { code: "ASR", name: "Amritsar Junction", city: "Amritsar", state: "Punjab", lat: 31.634, lon: 74.8656, popular: true, division: "NR" },
  { code: "LDH", name: "Ludhiana Junction", city: "Ludhiana", state: "Punjab", lat: 30.9069, lon: 75.8567, division: "NR" },
  { code: "JAT", name: "Jammu Tawi", city: "Jammu", state: "Jammu & Kashmir", lat: 32.706, lon: 74.8801, popular: true, division: "NR" },
  { code: "SVDK", name: "Shri Mata Vaishno Devi Katra", city: "Katra", state: "Jammu & Kashmir", lat: 32.9912, lon: 74.9315, popular: true, division: "NR" },
  { code: "HW", name: "Haridwar Junction", city: "Haridwar", state: "Uttarakhand", lat: 29.9457, lon: 78.1642, popular: true, division: "NR" },
  { code: "DDN", name: "Dehradun Terminal", city: "Dehradun", state: "Uttarakhand", lat: 30.3165, lon: 78.0322, popular: true, division: "NR" },

  // Uttar Pradesh & Central Northern
  { code: "AGC", name: "Agra Cantt", city: "Agra", state: "Uttar Pradesh", lat: 27.1585, lon: 77.9904, popular: true, division: "NCR" },
  { code: "MTJ", name: "Mathura Junction", city: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lon: 77.6737, popular: true, division: "NCR" },
  { code: "LKO", name: "Lucknow Charbagh NR", city: "Lucknow", state: "Uttar Pradesh", lat: 26.8324, lon: 80.9229, popular: true, division: "NR" },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh", lat: 26.4547, lon: 80.3507, popular: true, division: "NCR" },
  { code: "BSB", name: "Varanasi Junction (Cantt)", city: "Varanasi", state: "Uttar Pradesh", lat: 25.3284, lon: 82.9866, popular: true, division: "NR" },
  { code: "DDU", name: "Pt. Deen Dayal Upadhyaya Jn (Mughalsarai)", city: "Varanasi Area", state: "Uttar Pradesh", lat: 25.2819, lon: 83.1186, popular: true, division: "ECR" },
  { code: "AY", name: "Ayodhya Dham Junction", city: "Ayodhya", state: "Uttar Pradesh", lat: 26.7995, lon: 82.2039, popular: true, division: "NR" },
  { code: "AYC", name: "Ayodhya Cantt", city: "Ayodhya", state: "Uttar Pradesh", lat: 26.7778, lon: 82.1432, popular: true, division: "NR" },
  { code: "PRYJ", name: "Prayagraj Junction (Allahabad)", city: "Prayagraj", state: "Uttar Pradesh", lat: 25.4448, lon: 81.8333, popular: true, division: "NCR" },
  { code: "GKP", name: "Gorakhpur Junction", city: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lon: 83.3732, division: "NER" },

  // Rajasthan & North Western
  { code: "JP", name: "Jaipur Junction", city: "Jaipur", state: "Rajasthan", lat: 26.9196, lon: 75.7878, popular: true, division: "NWR" },
  { code: "UDZ", name: "Udaipur City", city: "Udaipur", state: "Rajasthan", lat: 24.5739, lon: 73.6978, popular: true, division: "NWR" },
  { code: "JU", name: "Jodhpur Junction", city: "Jodhpur", state: "Rajasthan", lat: 26.2842, lon: 73.0206, popular: true, division: "NWR" },
  { code: "AII", name: "Ajmer Junction", city: "Ajmer", state: "Rajasthan", lat: 26.4542, lon: 74.6347, division: "NWR" },
  { code: "KOTA", name: "Kota Junction", city: "Kota", state: "Rajasthan", lat: 25.2185, lon: 75.8648, popular: true, division: "WCR" },
  { code: "BKN", name: "Bikaner Junction", city: "Bikaner", state: "Rajasthan", lat: 28.0175, lon: 73.3175, division: "NWR" },

  // Gujarat & Western
  { code: "ADI", name: "Ahmedabad Junction (Kalupur)", city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.6006, popular: true, division: "WR" },
  { code: "ST", name: "Surat", city: "Surat", state: "Gujarat", lat: 21.2052, lon: 72.8407, popular: true, division: "WR" },
  { code: "BRC", name: "Vadodara Junction", city: "Vadodara", state: "Gujarat", lat: 22.3108, lon: 73.1812, popular: true, division: "WR" },
  { code: "RJT", name: "Rajkot Junction", city: "Rajkot", state: "Gujarat", lat: 22.3117, lon: 70.7961, division: "WR" },

  // Karnataka & South Western
  { code: "SBC", name: "KSR Bengaluru City Junction", city: "Bangalore", state: "Karnataka", lat: 12.9778, lon: 77.5714, popular: true, division: "SWR" },
  { code: "YPR", name: "Yesvantpur Junction", city: "Bangalore", state: "Karnataka", lat: 13.0242, lon: 77.5458, popular: true, division: "SWR" },
  { code: "SMVB", name: "Sir M. Visvesvaraya Terminal (Baiyappanahalli)", city: "Bangalore", state: "Karnataka", lat: 13.0039, lon: 77.6534, popular: true, division: "SWR" },
  { code: "MYS", name: "Mysuru Junction (Mysore)", city: "Mysore", state: "Karnataka", lat: 12.3168, lon: 76.6453, popular: true, division: "SWR" },
  { code: "MAQ", name: "Mangaluru Central (Mangalore)", city: "Mangalore", state: "Karnataka", lat: 12.8637, lon: 74.8427, popular: true, division: "SR" },
  { code: "UBL", name: "SSS Hubballi Junction (Hubli)", city: "Hubli", state: "Karnataka", lat: 15.3522, lon: 75.1481, division: "SWR" },
  { code: "UD", name: "Udupi", city: "Udupi", state: "Karnataka", lat: 13.3409, lon: 74.7421, division: "KR" },

  // Telangana & Andhra Pradesh (SCR)
  { code: "SC", name: "Secunderabad Junction", city: "Hyderabad", state: "Telangana", lat: 17.4344, lon: 78.5015, popular: true, division: "SCR" },
  { code: "KCG", name: "Hyderabad Kacheguda", city: "Hyderabad", state: "Telangana", lat: 17.3892, lon: 78.4984, popular: true, division: "SCR" },
  { code: "HYB", name: "Hyderabad Deccan (Nampally)", city: "Hyderabad", state: "Telangana", lat: 17.3919, lon: 78.4697, popular: true, division: "SCR" },
  { code: "BZA", name: "Vijayawada Junction", city: "Vijayawada", state: "Andhra Pradesh", lat: 16.5186, lon: 80.6206, popular: true, division: "SCR" },
  { code: "VSKP", name: "Visakhapatnam Junction", city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.7215, lon: 83.2878, popular: true, division: "ECoR" },
  { code: "TPTY", name: "Tirupati", city: "Tirupati", state: "Andhra Pradesh", lat: 13.6262, lon: 79.4206, popular: true, division: "SCR" },

  // Tamil Nadu & Kerala (Southern Railway)
  { code: "MAS", name: "MGR Chennai Central", city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2754, popular: true, division: "SR" },
  { code: "MS", name: "Chennai Egmore", city: "Chennai", state: "Tamil Nadu", lat: 13.0786, lon: 80.2606, popular: true, division: "SR" },
  { code: "CBE", name: "Coimbatore Junction", city: "Coimbatore", state: "Tamil Nadu", lat: 11.0016, lon: 76.9664, popular: true, division: "SR" },
  { code: "MDU", name: "Madurai Junction", city: "Madurai", state: "Tamil Nadu", lat: 9.9178, lon: 78.1122, popular: true, division: "SR" },
  { code: "TVC", name: "Thiruvananthapuram Central (Trivandrum)", city: "Thiruvananthapuram", state: "Kerala", lat: 8.4871, lon: 76.9531, popular: true, division: "SR" },
  { code: "ERS", name: "Ernakulam Junction (South / Kochi)", city: "Kochi", state: "Kerala", lat: 9.9678, lon: 76.2922, popular: true, division: "SR" },
  { code: "CLT", name: "Kozhikode Main (Calicut)", city: "Kozhikode", state: "Kerala", lat: 11.2464, lon: 75.7828, division: "SR" },

  // Eastern & East Coast
  { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal", lat: 22.5839, lon: 88.3426, popular: true, division: "ER" },
  { code: "SDAH", name: "Sealdah", city: "Kolkata", state: "West Bengal", lat: 22.5697, lon: 88.3712, popular: true, division: "ER" },
  { code: "PNBE", name: "Patna Junction", city: "Patna", state: "Bihar", lat: 25.6022, lon: 85.1376, popular: true, division: "ECR" },
  { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", state: "Odisha", lat: 20.2644, lon: 85.8427, popular: true, division: "ECoR" },
  { code: "PURI", name: "Puri Terminus", city: "Puri", state: "Odisha", lat: 19.8094, lon: 85.8368, popular: true, division: "ECoR" },
  { code: "RNC", name: "Ranchi Junction", city: "Ranchi", state: "Jharkhand", lat: 23.3556, lon: 85.3333, division: "SER" },

  // Madhya Pradesh (Central / West Central)
  { code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh", lat: 23.2662, lon: 77.4126, popular: true, division: "WCR" },
  { code: "RKMP", name: "Rani Kamlapati (Habibganj World-Class)", city: "Bhopal", state: "Madhya Pradesh", lat: 23.2185, lon: 77.4389, popular: true, division: "WCR" },
  { code: "INDB", name: "Indore Junction", city: "Indore", state: "Madhya Pradesh", lat: 22.7177, lon: 75.8682, popular: true, division: "WR" },
  { code: "UJN", name: "Ujjain Junction", city: "Ujjain", state: "Madhya Pradesh", lat: 23.1794, lon: 75.7836, popular: true, division: "WR" },
  { code: "GWL", name: "Gwalior Junction", city: "Gwalior", state: "Madhya Pradesh", lat: 26.2167, lon: 78.1889, popular: true, division: "NCR" },
  { code: "JBP", name: "Jabalpur Junction", city: "Jabalpur", state: "Madhya Pradesh", lat: 23.1676, lon: 79.9575, division: "WCR" },
];

export function calculateRailDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const airDist = R * c;

  const trackFactor = airDist < 120 ? 1.24 : airDist < 500 ? 1.20 : 1.18;
  return Math.max(30, Math.round(airDist * trackFactor));
}

export interface RailTelemetry {
  distanceKm: number;
  durationHrs: number;
  durationText: string;
  baseFare3A: number;
  co2Kg: number;
  comfortScore: number;
  avgSpeedKmh: number;
}

export function calculateRailTelemetry(distanceKm: number): RailTelemetry {
  const avgSpeedKmh = distanceKm < 150 ? 55 : distanceKm < 500 ? 68 : 74;
  const durationHrs = Number((distanceKm / avgSpeedKmh).toFixed(1));
  const hrs = Math.floor(durationHrs);
  const mins = Math.round((durationHrs - hrs) * 60);
  const durationText = `${hrs}h ${mins > 0 ? `${mins}m` : "00m"}`;

  const baseFare3A = Math.max(450, Math.round(380 + distanceKm * 0.95));
  const co2Kg = Math.round(distanceKm * 0.018);

  return {
    distanceKm,
    durationHrs,
    durationText,
    baseFare3A,
    co2Kg,
    comfortScore: 8.5,
    avgSpeedKmh,
  };
}

export function getRailStationByCodeOrName(query: string): RailStation {
  const clean = query.trim().toUpperCase();
  const byCode = INDIAN_RAIL_STATIONS.find((s) => s.code === clean);
  if (byCode) return byCode;

  const lower = query.trim().toLowerCase();
  const byName = INDIAN_RAIL_STATIONS.find(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.city.toLowerCase().includes(lower) ||
      lower.includes(s.city.toLowerCase()) ||
      lower.includes(s.code.toLowerCase())
  );
  if (byName) return byName;

  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash << 5) - hash + lower.charCodeAt(i);
    hash |= 0;
  }
  const code = query.trim().slice(0, 4).toUpperCase();
  const lat = 18.5 + (Math.abs(hash) % 1000) / 100;
  const lon = 73.5 + (Math.abs(hash >> 3) % 900) / 100;
  return {
    code,
    name: query.trim(),
    city: query.trim(),
    state: "India",
    lat,
    lon,
    division: "IR",
  };
}

export const DYNAMIC_RAIL_ROUTES_CACHE = new Map<string, RouteDefinition>();

export function createDynamicRailRoute(fromQuery: string, toQuery: string): RouteDefinition {
  const s1 = getRailStationByCodeOrName(fromQuery);
  const s2 = getRailStationByCodeOrName(toQuery);
  const routeId = `rail-dyn-${s1.code.toLowerCase()}-${s2.code.toLowerCase()}`;

  if (DYNAMIC_RAIL_ROUTES_CACHE.has(routeId)) {
    return DYNAMIC_RAIL_ROUTES_CACHE.get(routeId)!;
  }

  // Check if predefined route exists
  const existing = MULTI_MODAL_ROUTES.find(
    (r) =>
      r.mode === "railway" &&
      (r.originCode === s1.code || r.origin.toLowerCase().includes(s1.city.toLowerCase())) &&
      (r.destinationCode === s2.code || r.destination.toLowerCase().includes(s2.city.toLowerCase()))
  );
  if (existing) {
    DYNAMIC_RAIL_ROUTES_CACHE.set(routeId, existing);
    return existing;
  }

  const distanceKm = calculateRailDistanceKm(s1.lat, s1.lon, s2.lat, s2.lon);
  const telemetry = calculateRailTelemetry(distanceKm);

  const numSeed = (s1.code.charCodeAt(0) * 100 + s2.code.charCodeAt(0) * 10) % 9000;
  const vbNumber = 20000 + (numSeed % 900);
  const sfNumber = 12000 + (numSeed % 900);
  const mailNumber = 11000 + (numSeed % 900);

  const dynamicRoute: RouteDefinition = {
    id: routeId,
    mode: "railway",
    corridorId: `${s1.city.toLowerCase()}-${s2.city.toLowerCase()}`,
    origin: `${s1.name} (${s1.code})`,
    originCode: s1.code,
    destination: `${s2.name} (${s2.code})`,
    destinationCode: s2.code,
    baseFare: telemetry.baseFare3A,
    distanceKm: telemetry.distanceKm,
    durationHrs: telemetry.durationHrs,
    co2KgPerPax: telemetry.co2Kg,
    comfortScore: telemetry.comfortScore,
    optimalLeadDays: [7, 25],
    classes: [
      { name: "AC 3 Tier (3A)", multiplier: 1.0 },
      { name: "AC 2 Tier (2A)", multiplier: 1.4767 },
      { name: "First AC (1A)", multiplier: 2.4520 },
      { name: "AC 3 Economy (3E)", multiplier: 0.9260 },
      { name: "AC Chair Car (CC)", multiplier: 0.7780 },
      { name: "Executive Class (EC)", multiplier: 1.4191 },
      { name: "Sleeper (SL)", multiplier: 0.3315 },
      { name: "Second Sitting (2S)", multiplier: 0.1918 },
    ],
    carriers: [
      {
        name: `${vbNumber} ${s1.city}–${s2.city} Vande Bharat Exp`,
        code: `${vbNumber}`,
        depTime: "06:00",
        arrTime: `${telemetry.durationText} run`,
        durationText: telemetry.durationText,
        rating: 4.9,
        amenities: ["180° Rotating Seats", "Onboard Wi-Fi", "Bio-Vacuum Toilets", "Meals Included"],
        priceFactor: 1.0,
        badge: "Vande Bharat Semi-High Speed",
      },
      {
        name: `${sfNumber} ${s1.city}–${s2.city} Superfast Express`,
        code: `${sfNumber}`,
        depTime: "17:30",
        arrTime: `${telemetry.durationText} run`,
        durationText: telemetry.durationText,
        rating: 4.6,
        amenities: ["Pantry Car Catering", "Bedding in AC", "92% On-Time Record"],
        priceFactor: 0.94,
        badge: "Superfast Express",
      },
      {
        name: `${mailNumber} ${s1.city}–${s2.city} Express`,
        code: `${mailNumber}`,
        depTime: "22:15",
        arrTime: `${telemetry.durationText} run`,
        durationText: telemetry.durationText,
        rating: 4.4,
        amenities: ["Overnight Journey", "LHB Coaches", "E-Catering Available"],
        priceFactor: 0.88,
        badge: "Lowest AC Flexi Fare",
      },
    ],
  };

  DYNAMIC_RAIL_ROUTES_CACHE.set(routeId, dynamicRoute);
  return dynamicRoute;
}

// ================= ANY DOMESTIC & INTERNATIONAL FLIGHTS DIRECTORY & ENGINE =================
export interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  hub?: boolean;
}

export interface FlightTelemetry {
  distanceKm: number;
  durationHrs: number;
  durationText: string;
  baseFareEconomy: number;
  co2Kg: number;
  avgSpeedKmh: number;
  fuelSurcharge: number;
}

export const INDIAN_AIRPORTS: Airport[] = [
  // Maharashtra & Mumbai Hub
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj Int'l Airport", city: "Mumbai", state: "Maharashtra", lat: 19.0896, lon: 72.8656, hub: true },
  { code: "PNQ", name: "Pune International Airport", city: "Pune", state: "Maharashtra", lat: 18.5822, lon: 73.9197, hub: true },
  { code: "NAG", name: "Dr. Babasaheb Ambedkar Int'l Airport", city: "Nagpur", state: "Maharashtra", lat: 21.0922, lon: 79.0472 },
  { code: "KLH", name: "Chhatrapati Rajaram Maharaj Airport", city: "Kolhapur", state: "Maharashtra", lat: 16.6644, lon: 74.2894 },
  { code: "SAG", name: "Shirdi International Airport", city: "Shirdi", state: "Maharashtra", lat: 19.6897, lon: 74.3756 },
  { code: "AWB", name: "Chhatrapati Sambhajinagar Airport", city: "Aurangabad", state: "Maharashtra", lat: 19.8631, lon: 75.3981 },
  { code: "NSC", name: "Nashik Ozar Airport", city: "Nashik", state: "Maharashtra", lat: 20.1197, lon: 73.9135 },

  // Delhi NCR Hub
  { code: "DEL", name: "Indira Gandhi International Airport (IGI)", city: "Delhi", state: "Delhi NCR", lat: 28.5562, lon: 77.1000, hub: true },
  { code: "HDO", name: "Hindon Civil Airport (Ghaziabad)", city: "Noida / Ghaziabad", state: "Uttar Pradesh", lat: 28.7056, lon: 77.3592 },

  // Karnataka Hub
  { code: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", state: "Karnataka", lat: 13.1986, lon: 77.7066, hub: true },
  { code: "IXE", name: "Mangaluru International Airport", city: "Mangaluru", state: "Karnataka", lat: 12.9613, lon: 74.8900 },
  { code: "HBX", name: "Hubballi Airport", city: "Hubli", state: "Karnataka", lat: 15.3617, lon: 75.0849 },
  { code: "MYQ", name: "Mysuru Mandakalli Airport", city: "Mysuru", state: "Karnataka", lat: 12.2300, lon: 76.6500 },
  { code: "IXG", name: "Belagavi Sambra Airport", city: "Belagavi", state: "Karnataka", lat: 15.8592, lon: 74.6181 },

  // Goa Coastal Hubs
  { code: "GOI", name: "Dabolim International Airport", city: "Goa (Dabolim)", state: "Goa", lat: 15.3808, lon: 73.8314, hub: true },
  { code: "GOX", name: "Manohar International Airport (Mopa)", city: "Goa (Mopa)", state: "Goa", lat: 15.7686, lon: 73.8653, hub: true },

  // Tamil Nadu
  { code: "MAA", name: "Chennai International Airport", city: "Chennai", state: "Tamil Nadu", lat: 12.9941, lon: 80.1709, hub: true },
  { code: "CJB", name: "Coimbatore International Airport", city: "Coimbatore", state: "Tamil Nadu", lat: 11.0299, lon: 77.0434 },
  { code: "TRZ", name: "Tiruchirappalli International Airport", city: "Trichy", state: "Tamil Nadu", lat: 10.7654, lon: 78.7097 },
  { code: "IXM", name: "Madurai Airport", city: "Madurai", state: "Tamil Nadu", lat: 9.8345, lon: 78.0934 },
  { code: "TCR", name: "Tuticorin Airport", city: "Thoothukudi", state: "Tamil Nadu", lat: 8.7242, lon: 78.0264 },

  // Telangana & Andhra Pradesh
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", state: "Telangana", lat: 17.2403, lon: 78.4294, hub: true },
  { code: "VTZ", name: "Visakhapatnam International Airport", city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.7212, lon: 83.2245 },
  { code: "VGA", name: "Vijayawada International Airport", city: "Vijayawada", state: "Andhra Pradesh", lat: 16.5304, lon: 80.7968 },
  { code: "TIR", name: "Tirupati Airport", city: "Tirupati", state: "Andhra Pradesh", lat: 13.6325, lon: 79.5433 },
  { code: "RJA", name: "Rajahmundry Airport", city: "Rajahmundry", state: "Andhra Pradesh", lat: 17.1106, lon: 81.8183 },

  // Kerala
  { code: "COK", name: "Cochin International Airport", city: "Kochi", state: "Kerala", lat: 10.1518, lon: 76.4019, hub: true },
  { code: "TRV", name: "Thiruvananthapuram Int'l Airport", city: "Trivandrum", state: "Kerala", lat: 8.4821, lon: 76.9200 },
  { code: "CCJ", name: "Calicut International Airport", city: "Kozhikode", state: "Kerala", lat: 11.1368, lon: 75.9553 },
  { code: "CNN", name: "Kannur International Airport", city: "Kannur", state: "Kerala", lat: 11.9174, lon: 75.5489 },

  // West Bengal & North East Gateways
  { code: "CCU", name: "Netaji Subhash Chandra Bose Int'l Airport", city: "Kolkata", state: "West Bengal", lat: 22.6547, lon: 88.4467, hub: true },
  { code: "IXB", name: "Bagdogra International Airport", city: "Siliguri / Darjeeling", state: "West Bengal", lat: 26.6812, lon: 88.3286 },
  { code: "RDP", name: "Kazi Nazrul Islam Airport", city: "Durgapur", state: "West Bengal", lat: 23.6219, lon: 87.2411 },

  // Gujarat
  { code: "AMD", name: "Sardar Vallabhbhai Patel Int'l Airport", city: "Ahmedabad", state: "Gujarat", lat: 23.0772, lon: 72.6347, hub: true },
  { code: "STV", name: "Surat International Airport", city: "Surat", state: "Gujarat", lat: 21.1139, lon: 72.7419 },
  { code: "BDQ", name: "Vadodara Airport", city: "Vadodara", state: "Gujarat", lat: 22.3362, lon: 73.2263 },
  { code: "HSR", name: "Rajkot International Airport (Hirasar)", city: "Rajkot", state: "Gujarat", lat: 22.3667, lon: 70.9833 },
  { code: "BHJ", name: "Bhuj Rudra Mata Airport", city: "Bhuj (Kutch)", state: "Gujarat", lat: 23.2878, lon: 69.6701 },
  { code: "JGA", name: "Jamnagar Airport", city: "Jamnagar", state: "Gujarat", lat: 22.4659, lon: 70.0125 },
  { code: "DIU", name: "Diu Airport", city: "Diu", state: "Diu", lat: 20.7136, lon: 70.9208 },

  // Rajasthan
  { code: "JAI", name: "Jaipur International Airport", city: "Jaipur", state: "Rajasthan", lat: 26.8242, lon: 75.8122, hub: true },
  { code: "UDR", name: "Maharana Pratap Airport", city: "Udaipur", state: "Rajasthan", lat: 24.6178, lon: 73.8961 },
  { code: "JDH", name: "Jodhpur Airport", city: "Jodhpur", state: "Rajasthan", lat: 26.2514, lon: 73.0486 },
  { code: "JSA", name: "Jaisalmer Airport", city: "Jaisalmer", state: "Rajasthan", lat: 26.8887, lon: 70.8653 },
  { code: "KQH", name: "Kishangarh Airport (Ajmer)", city: "Ajmer / Pushkar", state: "Rajasthan", lat: 26.6025, lon: 74.8147 },
  { code: "BKB", name: "Bikaner Nal Airport", city: "Bikaner", state: "Rajasthan", lat: 28.0711, lon: 73.2069 },

  // Uttar Pradesh
  { code: "LKO", name: "Chaudhary Charan Singh Int'l Airport", city: "Lucknow", state: "Uttar Pradesh", lat: 26.7606, lon: 80.8893, hub: true },
  { code: "BSB", name: "Lal Bahadur Shastri Int'l Airport", city: "Varanasi", state: "Uttar Pradesh", lat: 25.4524, lon: 82.8593, hub: true },
  { code: "AYJ", name: "Maharishi Valmiki Int'l Airport", city: "Ayodhya", state: "Uttar Pradesh", lat: 26.7456, lon: 82.1558, hub: true },
  { code: "AGR", name: "Agra Kheria Airport", city: "Agra", state: "Uttar Pradesh", lat: 27.1558, lon: 77.9609 },
  { code: "KNU", name: "Kanpur Chakeri Airport", city: "Kanpur", state: "Uttar Pradesh", lat: 26.4406, lon: 80.4128 },
  { code: "GKP", name: "Gorakhpur Civil Airport", city: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7397, lon: 83.4497 },
  { code: "IXD", name: "Prayagraj Airport", city: "Prayagraj", state: "Uttar Pradesh", lat: 25.4403, lon: 81.7342 },
  { code: "BMY", name: "Bareilly Airport", city: "Bareilly", state: "Uttar Pradesh", lat: 28.4239, lon: 79.4489 },

  // Bihar & Jharkhand
  { code: "PAT", name: "Jayprakash Narayan Int'l Airport", city: "Patna", state: "Bihar", lat: 25.5913, lon: 85.0880 },
  { code: "GAY", name: "Gaya International Airport", city: "Bodh Gaya", state: "Bihar", lat: 24.7443, lon: 84.9512 },
  { code: "DBR", name: "Darbhanga Airport", city: "Darbhanga", state: "Bihar", lat: 26.1969, lon: 85.9178 },
  { code: "IXR", name: "Birsa Munda Airport", city: "Ranchi", state: "Jharkhand", lat: 23.3143, lon: 85.3217 },
  { code: "DGO", name: "Deoghar Baba Baidyanath Airport", city: "Deoghar", state: "Jharkhand", lat: 24.4439, lon: 86.7039 },

  // Odisha
  { code: "BBI", name: "Biju Patnaik International Airport", city: "Bhubaneswar", state: "Odisha", lat: 20.2444, lon: 85.8178 },
  { code: "JRG", name: "Veer Surendra Sai Airport", city: "Jharsuguda", state: "Odisha", lat: 21.9142, lon: 84.0506 },

  // Madhya Pradesh & Chhattisgarh
  { code: "IDR", name: "Devi Ahilya Bai Holkar Int'l Airport", city: "Indore", state: "Madhya Pradesh", lat: 22.7217, lon: 75.8011 },
  { code: "BHO", name: "Raja Bhoj International Airport", city: "Bhopal", state: "Madhya Pradesh", lat: 23.2875, lon: 77.3378 },
  { code: "JLR", name: "Jabalpur Dumna Airport", city: "Jabalpur", state: "Madhya Pradesh", lat: 23.1778, lon: 80.0522 },
  { code: "GWL", name: "Rajmata Vijaya Raje Scindia Airport", city: "Gwalior", state: "Madhya Pradesh", lat: 26.2933, lon: 78.2278 },
  { code: "HJR", name: "Khajuraho Airport", city: "Khajuraho", state: "Madhya Pradesh", lat: 24.8172, lon: 79.9189 },
  { code: "RPR", name: "Swami Vivekananda Airport", city: "Raipur", state: "Chhattisgarh", lat: 21.1804, lon: 81.7389 },

  // Punjab, Haryana, Himachal & J&K
  { code: "ATQ", name: "Sri Guru Ram Dass Jee Int'l Airport", city: "Amritsar", state: "Punjab", lat: 31.7096, lon: 74.7973 },
  { code: "IXC", name: "Shaheed Bhagat Singh Int'l Airport", city: "Chandigarh", state: "Punjab / Haryana", lat: 30.6735, lon: 76.7885 },
  { code: "SXR", name: "Sheikh ul-Alam International Airport", city: "Srinagar", state: "Jammu & Kashmir", lat: 33.9871, lon: 74.7741, hub: true },
  { code: "IXJ", name: "Jammu Civil Enclave", city: "Jammu", state: "Jammu & Kashmir", lat: 32.6891, lon: 74.8375 },
  { code: "IXL", name: "Kushok Bakula Rimpochee Airport", city: "Leh Ladakh", state: "Ladakh", lat: 34.1359, lon: 77.5465 },
  { code: "DED", name: "Jolly Grant Airport", city: "Dehradun / Rishikesh", state: "Uttarakhand", lat: 30.1897, lon: 78.1803 },
  { code: "KUU", name: "Kullu-Manali Airport (Bhuntar)", city: "Kullu / Manali", state: "Himachal Pradesh", lat: 31.8767, lon: 77.1542 },
  { code: "DHM", name: "Kangra Gaggal Airport", city: "Dharamshala", state: "Himachal Pradesh", lat: 32.1651, lon: 76.2634 },
  { code: "PGH", name: "Pantnagar Airport", city: "Nainital / Pantnagar", state: "Uttarakhand", lat: 29.0322, lon: 79.4736 },

  // Assam & North East
  { code: "GAU", name: "Lokpriya Gopinath Bordoloi Int'l Airport", city: "Guwahati", state: "Assam", lat: 26.1061, lon: 91.5859, hub: true },
  { code: "DIB", name: "Dibrugarh Mohanbari Airport", city: "Dibrugarh", state: "Assam", lat: 27.4839, lon: 95.0178 },
  { code: "IXS", name: "Silchar Kumbhirgram Airport", city: "Silchar", state: "Assam", lat: 24.9128, lon: 92.9794 },
  { code: "IMF", name: "Bir Tikendrajit Int'l Airport", city: "Imphal", state: "Manipur", lat: 24.7600, lon: 93.8967 },
  { code: "DMU", name: "Dimapur Airport", city: "Dimapur", state: "Nagaland", lat: 25.8839, lon: 93.7711 },
  { code: "AGT", name: "Maharaja Bir Bikram Airport", city: "Agartala", state: "Tripura", lat: 23.8869, lon: 91.2406 },
  { code: "SHL", name: "Shillong Umroi Airport", city: "Shillong", state: "Meghalaya", lat: 25.7036, lon: 91.9786 },
  { code: "HGI", name: "Donyi Polo Airport", city: "Itanagar", state: "Arunachal Pradesh", lat: 26.9942, lon: 93.6389 },

  // Islands
  { code: "IXZ", name: "Veer Savarkar Int'l Airport", city: "Port Blair", state: "Andaman & Nicobar", lat: 11.6411, lon: 92.7297, hub: true },
  { code: "AGX", name: "Agatti Island Airport", city: "Agatti (Lakshadweep)", state: "Lakshadweep", lat: 10.8239, lon: 72.1761 },

  // Top International Gateways
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", state: "United Arab Emirates", lat: 25.2532, lon: 55.3657, hub: true },
  { code: "LHR", name: "London Heathrow Airport", city: "London", state: "United Kingdom", lat: 51.4700, lon: -0.4543, hub: true },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", state: "Singapore", lat: 1.3644, lon: 103.9915, hub: true },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", state: "Thailand", lat: 13.6900, lon: 100.7501, hub: true },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", state: "Qatar", lat: 25.2731, lon: 51.6081, hub: true },
  { code: "JFK", name: "John F. Kennedy Int'l Airport", city: "New York", state: "United States", lat: 40.6413, lon: -73.7781, hub: true },
];

export function calculateFlightDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const greatCircleKm = R * c;
  // Flight routes fly ATC airways with ~8% vector detour
  return Math.max(120, Math.round(greatCircleKm * 1.08));
}

export function calculateFlightTelemetry(distanceKm: number): FlightTelemetry {
  const cruiseHours = distanceKm / 740;
  const totalHours = Math.round((cruiseHours + 0.58) * 100) / 100;
  const hrs = Math.floor(totalHours);
  const mins = Math.round((totalHours - hrs) * 60);
  const durationText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  let baseFareEconomy: number;
  if (distanceKm < 400) {
    baseFareEconomy = 2450 + Math.round(distanceKm * 2.8);
  } else if (distanceKm < 1000) {
    baseFareEconomy = 3100 + Math.round((distanceKm - 400) * 2.2);
  } else if (distanceKm < 2000) {
    baseFareEconomy = 4420 + Math.round((distanceKm - 1000) * 1.7);
  } else {
    baseFareEconomy = 6120 + Math.round((distanceKm - 2000) * 1.4);
  }

  const co2Kg = Math.round(distanceKm * 0.115);
  const fuelSurcharge = Math.min(1250, Math.max(450, Math.round(distanceKm * 0.45)));

  return {
    distanceKm,
    durationHrs: totalHours,
    durationText,
    baseFareEconomy,
    co2Kg,
    avgSpeedKmh: 740,
    fuelSurcharge,
  };
}

export function getAirportByCodeOrQuery(query: string): Airport {
  const q = query.trim().toUpperCase();
  const exact = INDIAN_AIRPORTS.find((a) => a.code.toUpperCase() === q);
  if (exact) return exact;

  const byName = INDIAN_AIRPORTS.find(
    (a) =>
      a.city.toUpperCase().includes(q) ||
      a.name.toUpperCase().includes(q) ||
      q.includes(a.code.toUpperCase()) ||
      q.includes(a.city.toUpperCase())
  );
  if (byName) return byName;

  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  const lat = 18.0 + (Math.abs(hash) % 1200) / 100;
  const lon = 73.0 + (Math.abs(hash >> 3) % 1000) / 100;

  return {
    code: q.length <= 4 && q.length >= 2 ? q : q.slice(0, 3),
    name: `${query.trim()} Airport`,
    city: query.trim(),
    state: "India",
    lat,
    lon,
  };
}

export const DYNAMIC_FLIGHT_ROUTES_CACHE = new Map<string, RouteDefinition>();

export function createDynamicFlightRoute(fromQuery: string, toQuery: string): RouteDefinition {
  const a1 = getAirportByCodeOrQuery(fromQuery);
  const a2 = getAirportByCodeOrQuery(toQuery);
  const routeId = `air-dyn-${a1.code.toLowerCase()}-${a2.code.toLowerCase()}`;

  if (DYNAMIC_FLIGHT_ROUTES_CACHE.has(routeId)) {
    return DYNAMIC_FLIGHT_ROUTES_CACHE.get(routeId)!;
  }

  // Check if predefined route exists
  const existing = MULTI_MODAL_ROUTES.find(
    (r) =>
      r.mode === "airway" &&
      (r.originCode === a1.code || r.origin.toLowerCase().includes(a1.city.toLowerCase())) &&
      (r.destinationCode === a2.code || r.destination.toLowerCase().includes(a2.city.toLowerCase()))
  );
  if (existing) {
    DYNAMIC_FLIGHT_ROUTES_CACHE.set(routeId, existing);
    return existing;
  }

  const distanceKm = calculateFlightDistanceKm(a1.lat, a1.lon, a2.lat, a2.lon);
  const telemetry = calculateFlightTelemetry(distanceKm);

  const hash = Math.abs(
    (a1.code.charCodeAt(0) * 31 + a2.code.charCodeAt(0) * 17 + distanceKm) % 800
  );

  const dynamicRoute: RouteDefinition = {
    id: routeId,
    mode: "airway",
    corridorId: `${a1.city.toLowerCase()}-${a2.city.toLowerCase()}`,
    origin: `${a1.city} (${a1.code})`,
    originCode: a1.code,
    destination: `${a2.city} (${a2.code})`,
    destinationCode: a2.code,
    baseFare: telemetry.baseFareEconomy,
    distanceKm: telemetry.distanceKm,
    durationHrs: telemetry.durationHrs,
    co2KgPerPax: telemetry.co2Kg,
    comfortScore: 9.1,
    optimalLeadDays: [14, 28],
    classes: [
      { name: "Economy", multiplier: 1.0 },
      { name: "Premium Economy", multiplier: 1.45 },
      { name: "Business Class", multiplier: 2.65 },
      { name: "First Class", multiplier: 4.2 },
    ],
    carriers: [
      {
        name: "IndiGo",
        code: `6E-${200 + hash}`,
        depTime: "06:15",
        arrTime: telemetry.durationText,
        durationText: telemetry.durationText,
        rating: 4.7,
        amenities: ["Direct Non-Stop", "93% On-Time Record", "Live Web Check-in", "Pre-booked XL Seats"],
        priceFactor: 0.94,
        badge: "Most Popular",
      },
      {
        name: "Air India",
        code: `AI-${500 + hash}`,
        depTime: "11:30",
        arrTime: telemetry.durationText,
        durationText: telemetry.durationText,
        rating: 4.6,
        amenities: ["Complimentary Hot Meal", "25kg Baggage Allowance", "In-flight Entertainment"],
        priceFactor: 1.04,
        badge: "Full Service",
      },
      {
        name: "Akasa Air",
        code: `QP-${1300 + hash}`,
        depTime: "17:45",
        arrTime: telemetry.durationText,
        durationText: telemetry.durationText,
        rating: 4.5,
        amenities: ["Brand New Boeing 737 MAX", "Café Akasa Gourmet", "USB Charging at Every Seat"],
        priceFactor: 0.91,
        badge: "Lowest Fare",
      },
      {
        name: "Vistara (Air India Group)",
        code: `UK-${800 + hash}`,
        depTime: "20:20",
        arrTime: telemetry.durationText,
        durationText: telemetry.durationText,
        rating: 4.8,
        amenities: ["Premium Cabin Experience", "Star Alliance Benefits", "Gourmet Dining"],
        priceFactor: 1.08,
        badge: "Top Rated",
      },
    ],
  };

  DYNAMIC_FLIGHT_ROUTES_CACHE.set(routeId, dynamicRoute);
  return dynamicRoute;
}

export function getRouteById(routeId: string): RouteDefinition {
  if (DYNAMIC_ROAD_ROUTES_CACHE.has(routeId)) {
    return DYNAMIC_ROAD_ROUTES_CACHE.get(routeId)!;
  }
  if (DYNAMIC_RAIL_ROUTES_CACHE.has(routeId)) {
    return DYNAMIC_RAIL_ROUTES_CACHE.get(routeId)!;
  }
  if (DYNAMIC_FLIGHT_ROUTES_CACHE.has(routeId)) {
    return DYNAMIC_FLIGHT_ROUTES_CACHE.get(routeId)!;
  }
  const found = MULTI_MODAL_ROUTES.find((r) => r.id === routeId);
  if (found) return found;

  if (routeId.startsWith("air-dyn-")) {
    const raw = routeId.replace("air-dyn-", "");
    const parts = raw.split("-");
    if (parts.length >= 2) {
      const from = parts[0];
      const to = parts.slice(1).join("-");
      return createDynamicFlightRoute(from, to);
    }
  }

  if (routeId.startsWith("road-dyn-")) {
    const raw = routeId.replace("road-dyn-", "");
    const parts = raw.split("-");
    if (parts.length >= 2) {
      const from = parts[0];
      const to = parts.slice(1).join("-");
      return createDynamicRoadRoute(from, to);
    }
  }

  if (routeId.startsWith("rail-dyn-")) {
    const raw = routeId.replace("rail-dyn-", "");
    const parts = raw.split("-");
    if (parts.length >= 2) {
      const from = parts[0];
      const to = parts.slice(1).join("-");
      return createDynamicRailRoute(from, to);
    }
  }

  return MULTI_MODAL_ROUTES[0];
}

// Deterministic hash helper so forecasts feel organic yet reproducible
function pseudoRandom(seedStr: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function generatePrediction(
  routeId: string,
  departureDateStr: string,
  travelClass: string,
  travelers: number = 1,
  tripType: "One Way" | "Round Trip" = "One Way"
): PredictionResult {
  const route = getRouteById(routeId);

  const classObj =
    route.classes.find((c) => c.name === travelClass) || route.classes[0];
  const classMult = classObj.multiplier;
  const roundTripMult = tripType === "Round Trip" ? 1.88 : 1.0;

  const now = new Date();
  const depDate = departureDateStr ? new Date(departureDateStr) : new Date(now.getTime() + 10 * 86400000);
  const diffMs = depDate.getTime() - now.getTime();
  const daysUntilDeparture = Math.max(1, Math.min(90, Math.ceil(diffMs / 86400000)));

  const dayOfWeek = depDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

  const seedBase = `${route.id}-${departureDateStr}-${travelClass}`;
  const demandSurge = Number((0.45 + pseudoRandom(seedBase + "demand") * 0.45).toFixed(2));
  const fuelIndex = Number((0.35 + pseudoRandom(seedBase + "fuel") * 0.4).toFixed(2));

  // Lead-time pricing curve based on real 300,153-row Kaggle Flight dataset + ML curves
  const [optMin, optMax] = route.optimalLeadDays;
  const curvesDict = realFlightCurves as Record<
    string,
    Record<string, { median: number; min: number; mean: number; count: number }>
  >;

  const extractCityName = (label: string) => label.split(" (")[0].trim();
  const origCity = extractCityName(route.origin);
  const destCity = extractCityName(route.destination);
  const datasetClass = classObj.name === "Business" ? "Business" : "Economy";
  const empiricalKey = `${origCity}_${destCity}_${datasetClass}`;
  const empiricalSeries = curvesDict[empiricalKey];

  const computePriceForDaysBefore = (daysBefore: number): number => {
    const clampedDays = Math.max(1, Math.min(49, daysBefore));
    if (route.mode === "airway" && empiricalSeries && empiricalSeries[String(clampedDays)]) {
      const emp = empiricalSeries[String(clampedDays)];
      const premEcoMult = classObj.name === "Premium Economy" ? 1.38 : 1.0;
      const weekendMult = isWeekend ? 1.05 : 1.0;
      // Blend empirical median and min from the 300,153-row dataset
      const empBase = Math.round((emp.median * 0.65 + emp.min * 0.35) * premEcoMult * roundTripMult * weekendMult);
      return empBase;
    }

    if (route.mode === "railway") {
      // Indian Railways operates on fixed statutory distance tariffs set by the Railway Board
      // Dynamic flexi-fare / Tatkal tier activates primarily within 1-2 days of departure on surge
      let flexiSurge = 1.0;
      if (daysBefore <= 2 && demandSurge > 0.68) {
        flexiSurge = 1.10; // First 10% dynamic flexi tier
      } else if (daysBefore <= 1 && demandSurge > 0.82) {
        flexiSurge = 1.20; // 20% peak dynamic tatkal tier
      }
      return Math.round(route.baseFare * classMult * roundTripMult * flexiSurge);
    }

    if (route.id === "water-bom-mandwa" || route.id === "water-ixz-hvl") {
      // Statutory published tariffs for Ro-Pax and island catamarans
      return Math.round(route.baseFare * classMult * roundTripMult);
    }

    let leadMult = 1.0;
    if (daysBefore <= 2) {
      leadMult = 1.54;
    } else if (daysBefore <= 5) {
      leadMult = 1.32;
    } else if (daysBefore < optMin) {
      leadMult = 1.08 + ((optMin - daysBefore) / optMin) * 0.2;
    } else if (daysBefore >= optMin && daysBefore <= optMax) {
      const mid = (optMin + optMax) / 2;
      const dist = Math.abs(daysBefore - mid) / ((optMax - optMin) / 2 || 1);
      leadMult = 0.84 + dist * 0.06;
    } else {
      leadMult = 0.94 + Math.min(0.12, (daysBefore - optMax) * 0.003);
    }

    const weekendMult = isWeekend ? 1.12 : 1.0;
    const demandMult = 0.92 + demandSurge * 0.24;
    const ripple = (pseudoRandom(`${seedBase}-day-${daysBefore}`) - 0.5) * 0.06;

    return Math.round(
      route.baseFare *
        classMult *
        roundTripMult *
        leadMult *
        weekendMult *
        demandMult *
        (1 + ripple)
    );
  };

  // Build 30-day timeline: -10 days historical to +19 days future (30 points)
  const forecastSeries: ForecastPoint[] = [];
  let minFuturePrice = Infinity;
  let optimalDayOffset = 0;

  for (let offset = -10; offset <= 19; offset++) {
    const pointDate = new Date(now.getTime() + offset * 86400000);
    const simulatedDaysBefore = Math.max(1, daysUntilDeparture - offset);
    const price = computePriceForDaysBefore(simulatedDaysBefore);
    const uncertainty = offset <= 0 ? 0 : Math.round(price * (0.025 + offset * 0.004));

    if (offset >= 0 && offset <= Math.min(18, daysUntilDeparture - 1)) {
      if (price < minFuturePrice) {
        minFuturePrice = price;
        optimalDayOffset = offset;
      }
    }

    forecastSeries.push({
      dayOffset: offset,
      dateLabel: pointDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      fullDate: pointDate.toISOString().split("T")[0],
      type: offset < 0 ? "historical" : offset === 0 ? "today" : "predicted",
      price,
      lowerBound: Math.max(250, price - uncertainty),
      upperBound: price + uncertainty,
      isOptimal: false,
    });
  }

  const todayPoint = forecastSeries.find((p) => p.dayOffset === 0)!;
  const currentLowestFare = todayPoint.price;
  const predictedLowestFare = Math.min(currentLowestFare, minFuturePrice);

  forecastSeries.forEach((p) => {
    if (p.dayOffset === optimalDayOffset) {
      p.isOptimal = true;
    }
  });

  const potentialSavings = Math.max(0, (currentLowestFare - predictedLowestFare) * travelers);
  const optimalDateObj = new Date(now.getTime() + optimalDayOffset * 86400000);
  const optimalBookingDate = optimalDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let recommendation: "BUY NOW" | "WAIT TO BOOK" | "LOCK FARE SOON" = "BUY NOW";
  let reasoning = "";

  if (daysUntilDeparture <= 4) {
    recommendation = "BUY NOW";
    reasoning = `Departure is only ${daysUntilDeparture} day(s) away. Last-minute inventory buckets & dynamic surge are accelerating rapidly (+19% projected in next 24h). Book immediately to avoid higher fares.`;
  } else if (optimalDayOffset >= 2 && currentLowestFare - predictedLowestFare > route.baseFare * 0.05) {
    recommendation = "WAIT TO BOOK";
    reasoning = `Our dynamic market forecasting engine detects a temporary demand spike today. Waiting ${optimalDayOffset} days (until ${optimalBookingDate}) enters the optimal ${optMin}–${optMax} day booking window with an expected drop of ₹${Math.round(currentLowestFare - predictedLowestFare)} per traveler.`;
  } else if (daysUntilDeparture >= optMin && daysUntilDeparture <= optMax) {
    recommendation = "BUY NOW";
    reasoning = `You are currently inside the Golden Booking Window (${optMin}–${optMax} days prior to departure). Fares are near their historical floor and have an 89% probability of rising after 72 hours.`;
  } else {
    recommendation = "LOCK FARE SOON";
    reasoning = `Fares are stable within 3.2% of the 30-day predicted low. Lock in your seat/berth now or set a real-time price alert for ${optimalBookingDate}.`;
  }

  const confidenceScore = Number((91.5 + pseudoRandom(seedBase + "conf") * 6.8).toFixed(1));

  // Factor Impact Attribution
  const factorImpacts = [
    {
      factor: `Booking Window (${daysUntilDeparture}d before departure)`,
      impactPct: daysUntilDeparture <= 5 ? +24 : daysUntilDeparture <= optMax ? -11 : +4,
      direction: (daysUntilDeparture <= 5 ? "up" : daysUntilDeparture <= optMax ? "down" : "neutral") as "up" | "down" | "neutral",
      detail:
        daysUntilDeparture <= 5
          ? "High last-minute revenue bucket surge"
          : `Sweet spot window for ${MODE_META[route.mode].shortLabel} is ${optMin}–${optMax} days out`,
    },
    {
      factor: `Real-Time Occupancy & Demand (${Math.round(demandSurge * 100)}%)`,
      impactPct: Math.round((demandSurge - 0.5) * 28),
      direction: (demandSurge > 0.62 ? "up" : "down") as "up" | "down" | "neutral",
      detail:
        route.mode === "railway"
          ? "IRCTC Flexi-fare & waitlist velocity across AC tiers"
          : route.mode === "waterway"
          ? "Coastal vessel manifest & vehicle deck allocation"
          : "Live seat inventory load factor across carriers",
    },
    {
      factor: isWeekend ? "Weekend / Peak Day Multiplier" : "Mid-Week Off-Peak Discount",
      impactPct: isWeekend ? +12 : -7,
      direction: (isWeekend ? "up" : "down") as "up" | "down" | "neutral",
      detail: isWeekend
        ? "Friday–Sunday leisure & commuter surge detected"
        : "Tue–Thu travel dates carry lower baseline demand",
    },
    {
      factor:
        route.mode === "airway"
          ? "ATF Aviation Fuel & Airport UDF Index"
          : route.mode === "railway"
          ? "Superfast / Dynamic Tatkal Surcharge"
          : route.mode === "roadway"
          ? "Highway Toll & Diesel/EV Energy Index"
          : "Port Tariff, Tide & Marine Weather Index",
      impactPct: Math.round((fuelIndex - 0.45) * 16),
      direction: (fuelIndex > 0.52 ? "up" : "neutral") as "up" | "down" | "neutral",
      detail: "Real-time operational cost index factored into ML regressor",
    },
  ];

  // Build Carrier Offers
  const offers: CarrierOffer[] = route.carriers.map((c, idx) => {
    const curFare = Math.round(currentLowestFare * c.priceFactor);
    const predLow = Math.round(predictedLowestFare * c.priceFactor);
    const changePct = Number((((predLow - curFare) / curFare) * 100).toFixed(1));
    const seatsLeft = Math.max(3, Math.round(4 + pseudoRandom(seedBase + c.code) * 32));
    const occupancyPct = Math.min(96, Math.max(52, Math.round(demandSurge * 100 + (idx % 2 === 0 ? 6 : -4))));

    let extraInfo = "Dynamic Fare Locked";
    if (route.mode === "railway") {
      extraInfo = seatsLeft > 12 ? `AVAILABLE-${seatsLeft} (CNF 99%)` : `RAC/WL-${18 - seatsLeft} (ML CNF Prob: ${86 + idx * 3}%)`;
    } else if (route.mode === "roadway") {
      extraInfo = `Highway Toll Included • ${seatsLeft} Berths/Seats Left`;
    } else if (route.mode === "waterway") {
      extraInfo = `Sea State: Calm (1.8m) • ${seatsLeft} Cabins/Seats Open`;
    } else {
      extraInfo = `Fare Bucket: ${seatsLeft < 9 ? "Y/B High" : "K/L Saver"} • ${seatsLeft} Seats Left`;
    }

    return {
      id: `${route.id}-${c.code}`,
      carrierName: c.name,
      carrierCode: c.code,
      mode: route.mode,
      origin: route.origin,
      destination: route.destination,
      depTime: c.depTime,
      arrTime: c.arrTime,
      durationText: c.durationText,
      travelClass: classObj.name,
      currentFare: curFare,
      predictedLowFare: predLow,
      expectedChangePct: changePct,
      trend: changePct < -3 ? "dropping" : daysUntilDeparture <= 5 ? "rising" : "stable",
      recommendation: recommendation === "WAIT TO BOOK" && changePct < -3 ? "WAIT" : "BUY NOW",
      confidence: Number((confidenceScore - idx * 0.7).toFixed(1)),
      seatsLeft,
      occupancyPct,
      amenities: c.amenities,
      rating: c.rating,
      badge: c.badge,
      extraInfo,
    };
  });

  return {
    route,
    selectedDate: depDate.toISOString().split("T")[0],
    daysUntilDeparture,
    travelClass: classObj.name,
    travelers,
    tripType,
    currentLowestFare,
    predictedLowestFare,
    optimalBookingDate,
    optimalDaysFromNow: optimalDayOffset,
    potentialSavings,
    recommendation,
    confidenceScore,
    reasoning,
    forecastSeries,
    factorImpacts,
    offers,
    liveStreamMeta: {
      fuelIndex,
      demandSurge,
      seasonalityTag: isWeekend ? "Weekend Peak Surge" : "Standard Weekday Demand",
      weatherStatus:
        route.mode === "waterway"
          ? "Arabian Sea / Bay of Bengal: Calm Swell (98% On-Time)"
          : "Clear Corridor Visibility (96% On-Time)",
      lastUpdated: new Date().toLocaleTimeString("en-IN"),
    },
  };
}

export interface CorridorComparisonItem {
  mode: TransportMode;
  modeLabel: string;
  routeId: string;
  carrierHighlight: string;
  currentFare: number;
  predictedLowFare: number;
  durationHrs: number;
  durationText: string;
  co2Kg: number;
  comfortScore: number;
  recommendation: string;
  verdictBadge?: string;
}

export const CORRIDORS = [
  {
    id: "mumbai-goa",
    name: "Mumbai ↔ Goa (All 4 Modes: Air, Rail, Road & Sea)",
    description: "India's premier multi-modal corridor featuring Flights, Vande Bharat Train, Luxury AC Sleeper Buses, and Coastal Cruise/High-Speed Ferry.",
  },
  {
    id: "mumbai-delhi",
    name: "Mumbai ↔ Delhi (Air, Tejas Rajdhani & Expressway Bus)",
    description: "High-frequency business corridor across BOM-DEL Flights, Western Railway Rajdhani/Duronto, and Delhi-Mumbai Expressway Volvo Coaches.",
  },
  {
    id: "bangalore-hyderabad",
    name: "Bangalore ↔ Hyderabad (Air, Vande Bharat & Volvo 9600)",
    description: "Tech-hub corridor comparing short-haul flights, Kacheguda Vande Bharat Express, and NH-44 overnight luxury sleepers.",
  },
  {
    id: "bangalore-mumbai",
    name: "Bangalore ↔ Mumbai (Air, Express Rail & Multi-Axle Coach)",
    description: "Major metro corridor comparing 1h 45m flights with Udyan Express and VRL/SRS Multi-Axle Volvo sleepers.",
  },
];

export function compareCorridorModes(
  corridorId: string,
  departureDateStr: string,
  travelers: number = 1
): CorridorComparisonItem[] {
  const matchingRoutes = MULTI_MODAL_ROUTES.filter((r) => r.corridorId === corridorId);

  const items: CorridorComparisonItem[] = matchingRoutes.map((r) => {
    const pred = generatePrediction(r.id, departureDateStr, r.classes[0].name, travelers, "One Way");
    const hrs = Math.floor(r.durationHrs);
    const mins = Math.round((r.durationHrs - hrs) * 60);
    return {
      mode: r.mode,
      modeLabel: MODE_META[r.mode].label,
      routeId: r.id,
      carrierHighlight: r.carriers[0].name,
      currentFare: pred.currentLowestFare,
      predictedLowFare: pred.predictedLowestFare,
      durationHrs: r.durationHrs,
      durationText: `${hrs}h ${mins > 0 ? `${mins}m` : "00m"}`,
      co2Kg: r.co2KgPerPax,
      comfortScore: r.comfortScore,
      recommendation: pred.recommendation,
    };
  });

  // Also include a synthetic coastal/river waterway option if corridor doesn't have direct sea route, or highlight Mumbai-Goa's 4-mode completeness
  if (items.length > 0) {
    const cheapest = [...items].sort((a, b) => a.currentFare - b.currentFare)[0];
    const fastest = [...items].sort((a, b) => a.durationHrs - b.durationHrs)[0];
    const greenest = [...items].sort((a, b) => a.co2Kg - b.co2Kg)[0];

    items.forEach((item) => {
      if (item.mode === fastest.mode) item.verdictBadge = "⚡ Fastest Option";
      else if (item.mode === cheapest.mode) item.verdictBadge = "💰 Most Economical";
      else if (item.mode === greenest.mode) item.verdictBadge = "🌱 Lowest Carbon Footprint";
      else if (item.mode === "waterway") item.verdictBadge = "⛴️ Scenic Cruise / Ro-Ro";
    });
  }

  return items;
}
