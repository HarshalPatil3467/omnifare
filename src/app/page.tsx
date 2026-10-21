"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Plane,
  Train,
  Bus,
  Ship,
  Search,
  Calendar,
  Bell,
  HelpCircle,
  LogOut,
  TrendingDown,
  CheckCircle2,
  Compass,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Layers,
  Activity,
  Sun,
  Luggage,
  Navigation,
  ExternalLink,
  Sparkles,
  ArrowLeftRight,
  Car,
  Fuel,
  Zap,
  MapPin,
} from "lucide-react";
import {
  TransportMode,
  MULTI_MODAL_ROUTES,
  MODE_META,
  generatePrediction,
  CarrierOffer,
  INDIAN_ROAD_CITIES,
  createDynamicRoadRoute,
  INDIAN_RAIL_STATIONS,
  createDynamicRailRoute,
  INDIAN_AIRPORTS,
  createDynamicFlightRoute,
  getRouteById,
  calculateHighwayTelemetry,
  calculateRailTelemetry,
  calculateFlightTelemetry,
  HighwayTelemetry,
  RailTelemetry,
  FlightTelemetry,
  RailStation,
  Airport,
} from "@/lib/fareEngine";
import CrossModeComparator from "@/components/CrossModeComparator";
import BookingPartnerModal from "@/components/BookingPartnerModal";

function getDefaultDepartureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

type ActiveTab =
  | "search"
  | "dashboard"
  | "compare"
  | "bookings"
  | "help"
  | "login";

interface RecentSearchItem {
  id: string;
  mode: TransportMode;
  routeId: string;
  routeCode: string;
  travelDate: string;
  lowestPrice: number;
  predictedLow: number;
  searchedAgo: string;
  verdict: "BUY NOW" | "WAIT";
}

interface SavedTripItem {
  id: string;
  title: string;
  mode: TransportMode;
  routeCode: string;
  routeId: string;
  dateText: string;
  travelers: number;
  targetPrice: number;
}

interface BookingItem {
  id: string;
  pnr: string;
  mode: TransportMode;
  carrierName: string;
  carrierCode: string;
  origin: string;
  destination: string;
  travelDate: string;
  depTime: string;
  travelClass: string;
  travelers: number;
  amountPaid: number;
  mlSaved: number;
  status: "Confirmed" | "Price Locked";
}

interface PriceAlertItem {
  id: string;
  mode: TransportMode;
  routeLabel: string;
  carrierName: string;
  currentFare: number;
  targetFare: number;
  travelDate: string;
  probability: number;
}

const HERO_BACKGROUNDS: Record<
  TransportMode,
  { image: string; badge: string; title: string; subtitle: string }
> = {
  airway: {
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80",
    badge: "Live GDS & Airline Direct Fares",
    title: "Smart Airfare Intelligence for Every Journey",
    subtitle:
      "Forecast ticket prices up to 49 days ahead with advance booking window analytics and live seat inventory load tracking.",
  },
  railway: {
    image:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1800&q=80",
    badge: "Official Indian Railways Tariffs",
    title: "Iconic Rail Journeys & Dynamic Fare Forecasting",
    subtitle:
      "Navigate Vande Bharat, Tejas Rajdhani & Konkan Railway statutory tariffs and flexi-fare buckets with real-time Waitlist confirmation probability.",
  },
  roadway: {
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1800&q=80",
    badge: "Intercity RTC & Verified Luxury Sleeper Coaches",
    title: "Effortless Overland & Expressway Travel",
    subtitle:
      "Compare Volvo 9600 AC sleepers, IntrCity SmartBuses, and intercity cabs with live weekend surge and highway toll analytics.",
  },
  waterway: {
    image:
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1800&q=80",
    badge: "Coastal Cruises, Ro-Ro Ferries & Island Catamarans",
    title: "Maritime Voyages Across Turquoise Waters",
    subtitle:
      "Reserve M2M Alibaug Ro-Ro vessels, Mumbai–Goa ocean cruises, and Andaman/Lakshadweep catamarans at optimal tide-adjusted fares.",
  },
};

const FEATURED_DESTINATIONS = [
  {
    title: "Goa Coastal Sanctuary",
    subtitle: "Compare Flights, Vande Bharat, Volvo & Cruise",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    mode: "waterway" as TransportMode,
    routeId: "water-bom-goa",
    tag: "All 4 Modes",
    startingFare: 980,
  },
  {
    title: "Swaraj Dweep (Havelock)",
    subtitle: "Port Blair → Havelock High-Speed Catamaran",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    mode: "waterway" as TransportMode,
    routeId: "water-ixz-hvl",
    tag: "Island Crossing",
    startingFare: 1450,
  },
  {
    title: "The Konkan Ghat Trail",
    subtitle: "Mumbai CSMT → Madgaon Vande Bharat",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    mode: "railway" as TransportMode,
    routeId: "rail-bom-goa",
    tag: "Statutory IRCTC Fare",
    startingFare: 1085,
  },
  {
    title: "New Delhi Capital Corridor",
    subtitle: "Dynamic Advance Window Airfare Predictor",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    mode: "airway" as TransportMode,
    routeId: "air-bom-del",
    tag: "Flagship Route",
    startingFare: 4850,
  },
];

const TEAM_MEMBERS = [
  { name: "Harshal Patil", roll: "APSIT-IT", email: "hp0198349@gmail.com" },
];

const INITIAL_RECENT_SEARCHES: RecentSearchItem[] = [
  {
    id: "rs-1",
    mode: "airway",
    routeId: "air-bom-del",
    routeCode: "Mumbai (BOM) → Delhi (DEL)",
    travelDate: "2026-10-25",
    lowestPrice: 4850,
    predictedLow: 4290,
    searchedAgo: "2 hours ago",
    verdict: "WAIT",
  },
  {
    id: "rs-2",
    mode: "railway",
    routeId: "rail-bom-goa",
    routeCode: "Mumbai CSMT → Goa Madgaon (Vande Bharat)",
    travelDate: "2026-10-28",
    lowestPrice: 1280,
    predictedLow: 1120,
    searchedAgo: "5 hours ago",
    verdict: "BUY NOW",
  },
  {
    id: "rs-3",
    mode: "roadway",
    routeId: "road-blr-hyd",
    routeCode: "Bangalore → Hyderabad (Volvo 9600)",
    travelDate: "2026-10-22",
    lowestPrice: 1050,
    predictedLow: 940,
    searchedAgo: "1 day ago",
    verdict: "BUY NOW",
  },
  {
    id: "rs-4",
    mode: "waterway",
    routeId: "water-bom-mandwa",
    routeCode: "Mumbai → Mandwa Alibaug (M2M Ro-Ro)",
    travelDate: "2026-10-24",
    lowestPrice: 440,
    predictedLow: 410,
    searchedAgo: "2 days ago",
    verdict: "BUY NOW",
  },
  {
    id: "rs-5",
    mode: "waterway",
    routeId: "water-bom-goa",
    routeCode: "Mumbai → Goa (Cordelia Cruise)",
    travelDate: "2026-11-05",
    lowestPrice: 6450,
    predictedLow: 5620,
    searchedAgo: "3 days ago",
    verdict: "WAIT",
  },
];

const INITIAL_SAVED_TRIPS: SavedTripItem[] = [
  {
    id: "st-1",
    title: "Goa Coastal Cruise & Beach Holiday",
    mode: "waterway",
    routeCode: "Mumbai → Goa (Cruise / Ferry)",
    routeId: "water-bom-goa",
    dateText: "Nov 5, 2026",
    travelers: 2,
    targetPrice: 5600,
  },
  {
    id: "st-2",
    title: "New Delhi Autumn Retreat",
    mode: "airway",
    routeCode: "BOM → DEL (IndiGo / Vistara)",
    routeId: "air-bom-del",
    dateText: "Oct 25, 2026",
    travelers: 1,
    targetPrice: 4350,
  },
  {
    id: "st-3",
    title: "Konkan Vande Bharat Express",
    mode: "railway",
    routeCode: "CSMT → MAO (22229)",
    routeId: "rail-bom-goa",
    dateText: "Oct 28, 2026",
    travelers: 4,
    targetPrice: 1150,
  },
];

export default function OmniFareApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");
  const [currentUser, setCurrentUser] = useState({
    name: "Harshal Patil",
    fullName: "Harshal Patil",
    email: "hp0198349@gmail.com",
    isGuest: false,
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("hp0198349@gmail.com");
  const [loginPassword, setLoginPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard Filter & States
  const [dashboardModeFilter, setDashboardModeFilter] = useState<TransportMode | "all">("all");
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(INITIAL_RECENT_SEARCHES);
  const [savedTrips, setSavedTrips] = useState<SavedTripItem[]>(INITIAL_SAVED_TRIPS);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState("");

  // Search & Prediction States
  const [selectedMode, setSelectedMode] = useState<TransportMode>("airway");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("air-bom-del");
  const [departureDate, setDepartureDate] = useState<string>(getDefaultDepartureDate);
  const [tripType, setTripType] = useState<"One Way" | "Round Trip">("One Way");
  const [selectedClass, setSelectedClass] = useState<string>("Economy");
  const [travelers, setTravelers] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookingModalOffer, setBookingModalOffer] = useState<CarrierOffer | null>(null);

  // Dedicated Roadways State (Anywhere in India Door-to-Door)
  const [roadOriginCity, setRoadOriginCity] = useState<string>("Mumbai");
  const [roadDestCity, setRoadDestCity] = useState<string>("Pune");
  const [isCustomRoadOrigin, setIsCustomRoadOrigin] = useState<boolean>(false);
  const [isCustomRoadDest, setIsCustomRoadDest] = useState<boolean>(false);
  const [roadVehicleFilter, setRoadVehicleFilter] = useState<"all" | "sleeper" | "rtc" | "cab_sedan" | "cab_suv">("all");

  // Dedicated Airways State (Any Airport to Any Airport in India & Global)
  const [flightOriginAirport, setFlightOriginAirport] = useState<string>("BOM");
  const [flightDestAirport, setFlightDestAirport] = useState<string>("DEL");
  const [isCustomFlightOrigin, setIsCustomFlightOrigin] = useState<boolean>(false);
  const [isCustomFlightDest, setIsCustomFlightDest] = useState<boolean>(false);

  // Dedicated Railways State (Any Station to Any Station in India)
  const [railOriginStation, setRailOriginStation] = useState<string>("CSMT");
  const [railDestStation, setRailDestStation] = useState<string>("NDLS");
  const [isCustomRailOrigin, setIsCustomRailOrigin] = useState<boolean>(false);
  const [isCustomRailDest, setIsCustomRailDest] = useState<boolean>(false);

  // Form Reset on Refresh & Explicit Reset Filter Handler
  const handleResetFilters = useCallback(() => {
    setSelectedMode("airway");
    setSelectedRouteId("air-bom-del");
    setFlightOriginAirport("BOM");
    setFlightDestAirport("DEL");
    setIsCustomFlightOrigin(false);
    setIsCustomFlightDest(false);
    setRoadOriginCity("Mumbai");
    setRoadDestCity("Pune");
    setIsCustomRoadOrigin(false);
    setIsCustomRoadDest(false);
    setRoadVehicleFilter("all");
    setRailOriginStation("CSMT");
    setRailDestStation("NDLS");
    setIsCustomRailOrigin(false);
    setIsCustomRailDest(false);
    setDepartureDate(getDefaultDepartureDate());
    setTripType("One Way");
    setSelectedClass("Economy");
    setTravelers(1);
    setToastMessage("Search filters reset to default");
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Ensure fresh default values on page reload/mount
  useEffect(() => {
    handleResetFilters();
  }, [handleResetFilters]);

  // Real-Time Live Rates & Telemetry States
  const [isLiveFeedActive, setIsLiveFeedActive] = useState<boolean>(true);
  const [liveWeatherInfo, setLiveWeatherInfo] = useState<string>("Open-Meteo Satellite Feed Active");
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<string>("Just now");
  const [liveOffers, setLiveOffers] = useState<CarrierOffer[] | null>(null);
  const [liveTickerNotice, setLiveTickerNotice] = useState<string | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);

  // Bookings & Alerts States
  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: "bk-101",
      pnr: "FS-AIR-8942",
      mode: "airway",
      carrierName: "IndiGo",
      carrierCode: "6E-5312",
      origin: "Bangalore (BLR)",
      destination: "Mumbai (BOM)",
      travelDate: "2026-10-29",
      depTime: "07:00",
      travelClass: "Economy",
      travelers: 1,
      amountPaid: 3690,
      mlSaved: 680,
      status: "Confirmed",
    },
    {
      id: "bk-102",
      pnr: "FS-RAIL-2229",
      mode: "railway",
      carrierName: "22229 CSMT–Madgaon Vande Bharat",
      carrierCode: "22229",
      origin: "Mumbai CSMT",
      destination: "Goa Madgaon (MAO)",
      travelDate: "2026-11-02",
      depTime: "05:25",
      travelClass: "AC Chair Car (CC)",
      travelers: 2,
      amountPaid: 2240,
      mlSaved: 420,
      status: "Confirmed",
    },
  ]);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlertItem[]>([
    {
      id: "al-1",
      mode: "airway",
      routeLabel: "Mumbai (BOM) → Delhi (DEL)",
      carrierName: "Akasa Air / IndiGo",
      currentFare: 4850,
      targetFare: 4290,
      travelDate: "2026-10-26",
      probability: 92,
    },
    {
      id: "al-2",
      mode: "waterway",
      routeLabel: "Mumbai (BPX) → Goa (Mormugao)",
      carrierName: "Cordelia Cruises / Konkan HSC",
      currentFare: 5800,
      targetFare: 4950,
      travelDate: "2026-11-08",
      probability: 87,
    },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Routes filtered by currently selected mode
  const modeRoutes = useMemo(
    () => MULTI_MODAL_ROUTES.filter((r) => r.mode === selectedMode),
    [selectedMode]
  );

  const currentRouteObj = useMemo(
    () => getRouteById(selectedRouteId),
    [selectedRouteId]
  );

  // Real-time aviation telemetry for flight journeys
  const flightTelemetry = useMemo(() => {
    if (selectedMode !== "airway") return null;
    return calculateFlightTelemetry(currentRouteObj.distanceKm);
  }, [selectedMode, currentRouteObj.distanceKm]);

  // Real-time highway telemetry for road trips
  const highwayTelemetry = useMemo(() => {
    if (selectedMode !== "roadway") return null;
    return calculateHighwayTelemetry(currentRouteObj.distanceKm);
  }, [selectedMode, currentRouteObj.distanceKm]);

  // Real-time railway telemetry for train journeys
  const railTelemetry = useMemo(() => {
    if (selectedMode !== "railway") return null;
    return calculateRailTelemetry(currentRouteObj.distanceKm);
  }, [selectedMode, currentRouteObj.distanceKm]);

  // Flight route updater for any domestic & international airport
  const handleUpdateFlightRoute = (from: string, to: string) => {
    const validFrom = from.trim() || "BOM";
    const validTo = to.trim() || "DEL";
    setFlightOriginAirport(validFrom);
    setFlightDestAirport(validTo);
    const dynamicRoute = createDynamicFlightRoute(validFrom, validTo);
    setSelectedRouteId(dynamicRoute.id);
    setSelectedClass(dynamicRoute.classes[0].name);
    triggerToast(`Flight Vector: ${dynamicRoute.originCode} ➔ ${dynamicRoute.destinationCode} (${dynamicRoute.distanceKm} km, ~${dynamicRoute.durationHrs} hrs)`);
  };

  const handleSwapFlightAirports = () => {
    const newFrom = flightDestAirport;
    const newTo = flightOriginAirport;
    handleUpdateFlightRoute(newFrom, newTo);
  };

  // Road route updater for anywhere in India door-to-door
  const handleUpdateRoadRoute = (from: string, to: string) => {
    const validFrom = from.trim() || "Mumbai";
    const validTo = to.trim() || "Pune";
    setRoadOriginCity(validFrom);
    setRoadDestCity(validTo);
    const dynamicRoute = createDynamicRoadRoute(validFrom, validTo);
    setSelectedRouteId(dynamicRoute.id);
    setSelectedClass(dynamicRoute.classes[0].name);
    triggerToast(`Highway Corridor: ${validFrom} ➔ ${validTo} (${dynamicRoute.distanceKm} km, ~${dynamicRoute.durationHrs} hrs)`);
  };

  const handleSwapRoadCities = () => {
    const newFrom = roadDestCity;
    const newTo = roadOriginCity;
    handleUpdateRoadRoute(newFrom, newTo);
  };

  // Rail route updater for any station to any station in India
  const handleUpdateRailRoute = (from: string, to: string) => {
    const validFrom = from.trim() || "CSMT";
    const validTo = to.trim() || "NDLS";
    setRailOriginStation(validFrom);
    setRailDestStation(validTo);
    const dynamicRoute = createDynamicRailRoute(validFrom, validTo);
    setSelectedRouteId(dynamicRoute.id);
    setSelectedClass(dynamicRoute.classes[0].name);
    triggerToast(`Rail Track: ${dynamicRoute.originCode} ➔ ${dynamicRoute.destinationCode} (${dynamicRoute.distanceKm} km, ~${dynamicRoute.durationHrs} hrs)`);
  };

  const handleSwapRailStations = () => {
    const newFrom = railDestStation;
    const newTo = railOriginStation;
    handleUpdateRailRoute(newFrom, newTo);
  };

  // Switch mode handler
  const handleSelectMode = (mode: TransportMode) => {
    setSelectedMode(mode);
    if (mode === "airway") {
      const airRoute = createDynamicFlightRoute(flightOriginAirport, flightDestAirport);
      setSelectedRouteId(airRoute.id);
      setSelectedClass(airRoute.classes[0].name);
    } else if (mode === "roadway") {
      const roadRoute = createDynamicRoadRoute(roadOriginCity, roadDestCity);
      setSelectedRouteId(roadRoute.id);
      setSelectedClass(roadRoute.classes[0].name);
    } else if (mode === "railway") {
      const railRoute = createDynamicRailRoute(railOriginStation, railDestStation);
      setSelectedRouteId(railRoute.id);
      setSelectedClass(railRoute.classes[0].name);
    } else {
      const firstRoute = MULTI_MODAL_ROUTES.find((r) => r.mode === mode)!;
      setSelectedRouteId(firstRoute.id);
      setSelectedClass(firstRoute.classes[0].name);
    }
  };

  // Switch route handler
  const handleSelectRoute = (routeId: string) => {
    const found = getRouteById(routeId);
    if (found) {
      setSelectedMode(found.mode);
      setSelectedRouteId(found.id);
      setSelectedClass(found.classes[0].name);
      if (found.mode === "airway") {
        setFlightOriginAirport(found.originCode || "BOM");
        setFlightDestAirport(found.destinationCode || "DEL");
      } else if (found.mode === "roadway") {
        const cleanFrom = found.origin.split(" (")[0].trim();
        const cleanTo = found.destination.split(" (")[0].trim();
        setRoadOriginCity(cleanFrom);
        setRoadDestCity(cleanTo);
      } else if (found.mode === "railway") {
        setRailOriginStation(found.originCode || "CSMT");
        setRailDestStation(found.destinationCode || "NDLS");
      }
    }
  };

  // Generate ML Prediction for active route & parameters
  const prediction = useMemo(
    () =>
      generatePrediction(
        currentRouteObj.id,
        departureDate,
        selectedClass,
        travelers,
        tripType
      ),
    [currentRouteObj.id, departureDate, selectedClass, travelers, tripType]
  );

  // Real-Time Live Polling Function
  const fetchLiveRates = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setIsSyncingLive(true);
        const res = await fetch(
          `/api/live-rates?routeId=${currentRouteObj.id}&travelDate=${departureDate}&travelClass=${encodeURIComponent(
            selectedClass
          )}&travelers=${travelers}&tripType=${encodeURIComponent(tripType)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.updatedOffers) {
            setLiveOffers(data.updatedOffers);
          }
          if (data.liveWeather?.weatherText) {
            setLiveWeatherInfo(data.liveWeather.weatherText);
          }
          setLastLiveSyncTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
          if (data.updatedOffers?.[0]?.priceDelta) {
            const delta = data.updatedOffers[0].priceDelta;
            const msg =
              delta < 0
                ? `⚡ [Live Telemetry Update] ${data.updatedOffers[0].carrierName} fare dropped by -₹${Math.abs(
                    delta
                  )} to ₹${data.updatedOffers[0].currentFare.toLocaleString("en-IN")}!`
                : `⚡ [Live Telemetry Update] ${data.updatedOffers[0].carrierName} seat occupancy surged (+₹${delta}).`;
            setLiveTickerNotice(msg);
            setTimeout(() => setLiveTickerNotice(null), 4000);
          }
        }
      } catch (err) {
        // Fallback to offline prediction engine
      } finally {
        if (isManual) setIsSyncingLive(false);
      }
    },
    [currentRouteObj.id, departureDate, selectedClass, travelers, tripType]
  );

  useEffect(() => {
    fetchLiveRates(false);
    if (!isLiveFeedActive) return;
    const interval = setInterval(() => {
      fetchLiveRates(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveRates, isLiveFeedActive]);

  const displayedOffers = useMemo(() => {
    const baseOffers = liveOffers || prediction.offers;
    if (selectedMode !== "roadway" || roadVehicleFilter === "all") return baseOffers;

    let filtered = baseOffers;
    if (roadVehicleFilter === "sleeper") {
      filtered = baseOffers.filter(
        (o) =>
          o.carrierName.toLowerCase().includes("sleeper") ||
          o.carrierName.toLowerCase().includes("smartbus") ||
          o.carrierName.toLowerCase().includes("zingbus") ||
          o.travelClass.toLowerCase().includes("sleeper")
      );
    } else if (roadVehicleFilter === "rtc") {
      filtered = baseOffers.filter(
        (o) =>
          o.carrierName.toLowerCase().includes("rtc") ||
          o.carrierName.toLowerCase().includes("shivneri") ||
          o.carrierName.toLowerCase().includes("airavat") ||
          o.badge?.toLowerCase().includes("rtc")
      );
    } else if (roadVehicleFilter === "cab_sedan") {
      filtered = baseOffers.filter(
        (o) =>
          o.carrierName.toLowerCase().includes("sedan") ||
          o.carrierName.toLowerCase().includes("dzire") ||
          o.travelClass.toLowerCase().includes("sedan")
      );
    } else if (roadVehicleFilter === "cab_suv") {
      filtered = baseOffers.filter(
        (o) =>
          o.carrierName.toLowerCase().includes("suv") ||
          o.carrierName.toLowerCase().includes("innova") ||
          o.travelClass.toLowerCase().includes("suv")
      );
    }
    return filtered.length > 0 ? filtered : baseOffers;
  }, [liveOffers, prediction.offers, selectedMode, roadVehicleFilter]);

  const getModeIcon = (mode: TransportMode, className = "w-4 h-4") => {
    if (mode === "airway") return <Plane className={`${className} text-blue-600`} />;
    if (mode === "railway") return <Train className={`${className} text-emerald-600`} />;
    if (mode === "roadway") return <Bus className={`${className} text-amber-600`} />;
    return <Ship className={`${className} text-cyan-600`} />;
  };

  // Book / Lock Fare Handler
  const handleBookOffer = (offer: CarrierOffer) => {
    const newBooking: BookingItem = {
      id: `bk-${Date.now()}`,
      pnr: `FS-${offer.mode.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      mode: offer.mode,
      carrierName: offer.carrierName,
      carrierCode: offer.carrierCode,
      origin: offer.origin,
      destination: offer.destination,
      travelDate: departureDate,
      depTime: offer.depTime,
      travelClass: offer.travelClass,
      travelers,
      amountPaid: offer.currentFare * travelers,
      mlSaved: Math.max(250, Math.round(offer.currentFare * 0.14) * travelers),
      status: "Confirmed",
    };
    setBookings((prev) => [newBooking, ...prev]);
    triggerToast(
      `Confirmed ${offer.carrierName} (${offer.origin} → ${offer.destination}) • PNR: ${newBooking.pnr}`
    );
    setActiveTab("bookings");
  };

  // Set Price Alert Handler
  const handleCreateAlert = (offer: CarrierOffer) => {
    const newAlert: PriceAlertItem = {
      id: `al-${Date.now()}`,
      mode: offer.mode,
      routeLabel: `${offer.origin} → ${offer.destination}`,
      carrierName: offer.carrierName,
      currentFare: offer.currentFare,
      targetFare: offer.predictedLowFare,
      travelDate: departureDate,
      probability: Math.round(offer.confidence),
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
    triggerToast(
      `Price Alert set for ${offer.carrierName} at target ₹${offer.predictedLowFare.toLocaleString("en-IN")}!`
    );
  };

  // Add to Recent Searches when clicking Search
  const handleRunSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: RecentSearchItem = {
      id: `rs-${Date.now()}`,
      mode: currentRouteObj.mode,
      routeId: currentRouteObj.id,
      routeCode: `${currentRouteObj.originCode} → ${currentRouteObj.destinationCode} (${MODE_META[currentRouteObj.mode].shortLabel})`,
      travelDate: departureDate,
      lowestPrice: prediction.currentLowestFare,
      predictedLow: prediction.predictedLowestFare,
      searchedAgo: "Just now",
      verdict: prediction.recommendation === "WAIT TO BOOK" ? "WAIT" : "BUY NOW",
    };
    setRecentSearches((prev) => [newEntry, ...prev.slice(0, 7)]);
    triggerToast(
      `Analyzed ${currentRouteObj.originCode} → ${currentRouteObj.destinationCode} (${prediction.confidenceScore}% confidence)`
    );
  };

  const handleSaveTrip = () => {
    const title =
      newTripTitle.trim() ||
      `${currentRouteObj.destination.split(" ")[0]} ${MODE_META[currentRouteObj.mode].shortLabel} Trip`;
    const newSaved: SavedTripItem = {
      id: `st-${Date.now()}`,
      title,
      mode: currentRouteObj.mode,
      routeCode: `${currentRouteObj.originCode} → ${currentRouteObj.destinationCode}`,
      routeId: currentRouteObj.id,
      dateText: new Date(departureDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      travelers,
      targetPrice: prediction.predictedLowestFare,
    };
    setSavedTrips((prev) => [newSaved, ...prev]);
    setNewTripTitle("");
    setShowSaveModal(false);
    triggerToast(`Saved "${title}" to your Travel Watchlist!`);
  };

  const filteredRecentSearches =
    dashboardModeFilter === "all"
      ? recentSearches
      : recentSearches.filter((r) => r.mode === dashboardModeFilter);

  const heroMeta = HERO_BACKGROUNDS[selectedMode];

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <Compass className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ================= SLEEK GLASSMORPHISM TRAVEL NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab("search")}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-white group-hover:rotate-45 transition duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  Omni<span className="text-blue-600">Fare</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold">
                  Multi-Modal ML
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Multi-Modal Travel Fare Prediction Using ML
              </p>
            </div>
          </button>

          {/* Center Navigation */}
          <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {[
              { id: "search", label: "Explore & Predict", icon: <Compass className="w-4 h-4" /> },
              { id: "compare", label: "Compare 4 Modes", icon: <Layers className="w-4 h-4" /> },
              { id: "dashboard", label: "Traveler Hub", icon: <Luggage className="w-4 h-4" /> },
              { id: "bookings", label: `Itineraries (${bookings.length})`, icon: <Calendar className="w-4 h-4" /> },
              { id: "help", label: "About & Security", icon: <HelpCircle className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Traveler Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("bookings")}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs transition"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              Alerts ({priceAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
            >
              {currentUser.name}
            </button>
            <button
              onClick={() => {
                setCurrentUser({
                  name: "Guest",
                  fullName: "Guest Traveler",
                  email: "guest@omnifare.ai",
                  isGuest: true,
                });
                setActiveTab("login");
                triggerToast("Signed out successfully");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-semibold text-xs sm:text-sm transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              {currentUser.isGuest ? "Sign In" : "Sign Out"}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 w-full">
        {/* ----------------- 1. EXPLORE & PREDICT VIEW ----------------- */}
        {activeTab === "search" && (
          <div>
            {/* SCENIC TRAVEL PHOTOGRAPHY HERO BANNER */}
            <div className="relative w-full overflow-hidden">
              <div
                className="h-[400px] sm:h-[430px] w-full bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url('${heroMeta.image}')` }}
              >
                <div className="w-full h-full bg-gradient-to-b from-slate-950/65 via-slate-900/50 to-slate-950/75 flex flex-col items-center justify-start pt-11 sm:pt-14 px-4 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold tracking-wide mb-4">
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    {heroMeta.badge}
                  </span>
                  <h1 className="font-display text-3xl sm:text-5xl font-bold text-white max-w-3xl leading-[1.12] tracking-tight">
                    {heroMeta.title}
                  </h1>
                  <p className="text-slate-200 text-sm sm:text-base mt-3 max-w-2xl font-normal leading-relaxed">
                    {heroMeta.subtitle}
                  </p>
                </div>
              </div>

              {/* FLOATING MULTI-MODAL TRAVEL SEARCH WIDGET */}
              <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-36 sm:-mt-32 relative z-20 pb-8">
                {/* Floating Mode Selector Pills */}
                <div className="bg-white rounded-2xl p-2 shadow-xl border border-slate-200/80 max-w-3xl mx-auto mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { m: "airway", label: "Flights", sub: "300k+ Fares" },
                      { m: "railway", label: "Trains", sub: "5,208 Trains" },
                      { m: "roadway", label: "Buses & Cabs", sub: "15.4k RedBus" },
                      { m: "waterway", label: "Cruises & Ferries", sub: "Ro-Ro & Sea" },
                    ] as const
                  ).map((item) => {
                    const isActive = selectedMode === item.m;
                    return (
                      <button
                        key={item.m}
                        type="button"
                        onClick={() => handleSelectMode(item.m)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition ${
                          isActive
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isActive ? "bg-white/15 text-white" : "bg-white border border-slate-200/80"
                          }`}
                        >
                          {isActive ? (
                            item.m === "airway" ? (
                              <Plane className="w-4 h-4 text-white" />
                            ) : item.m === "railway" ? (
                              <Train className="w-4 h-4 text-white" />
                            ) : item.m === "roadway" ? (
                              <Bus className="w-4 h-4 text-white" />
                            ) : (
                              <Ship className="w-4 h-4 text-white" />
                            )
                          ) : (
                            getModeIcon(item.m, "w-4 h-4")
                          )}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold leading-tight">
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] font-medium ${
                              isActive ? "text-slate-300" : "text-slate-400"
                            }`}
                          >
                            {item.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Main White Booking & Forecast Search Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/80">
                  <form onSubmit={handleRunSearch} className="space-y-5">
                    {selectedMode === "airway" ? (
                      /* ================= AIRWAYS: ANY AIRPORT TO ANY AIRPORT (DOMESTIC & GLOBAL) ================= */
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                              <Plane className="w-4 h-4 text-sky-600" />
                              Indian Domestic & Global Air Network (Any Airport to Any Airport)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Pick from 60+ commercial airports or type any custom IATA code / city
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Departure Airport */}
                          <div className="md:col-span-5 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 transition">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                                Departure Airport / Hub
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomFlightOrigin(!isCustomFlightOrigin)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                              >
                                {isCustomFlightOrigin ? "← Pick from 60+ Airports" : "+ Type Custom Airport"}
                              </button>
                            </div>

                            {isCustomFlightOrigin ? (
                              <input
                                type="text"
                                value={flightOriginAirport}
                                onChange={(e) => {
                                  setFlightOriginAirport(e.target.value.toUpperCase());
                                  handleUpdateFlightRoute(e.target.value.toUpperCase(), flightDestAirport);
                                }}
                                placeholder="e.g. BOM, DEL, BLR, GOI, CCU, JAI, PNQ..."
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none uppercase"
                              />
                            ) : (
                              <select
                                value={flightOriginAirport}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomFlightOrigin(true);
                                  } else {
                                    handleUpdateFlightRoute(e.target.value, flightDestAirport);
                                  }
                                }}
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                              >
                                {INDIAN_AIRPORTS.map((a) => (
                                  <option key={`orig-air-${a.code}`} value={a.code}>
                                    {a.city} — {a.name} ({a.code}) [{a.state}]
                                  </option>
                                ))}
                                <option value="CUSTOM">[+] Type Custom Airport Code / City...</option>
                              </select>
                            )}
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="truncate">
                                {INDIAN_AIRPORTS.find((a) => a.code.toUpperCase() === flightOriginAirport.toUpperCase())?.city || "Aviation Hub"} Airport
                              </span>
                              <span className="font-semibold text-sky-700 shrink-0 ml-1">
                                0 km baseline
                              </span>
                            </div>
                          </div>

                          {/* Swap Origin & Destination Airport */}
                          <div className="md:col-span-1 flex items-center justify-center -my-2 md:my-0">
                            <button
                              type="button"
                              onClick={handleSwapFlightAirports}
                              className="w-10 h-10 rounded-full bg-white hover:bg-sky-600 hover:text-white border border-slate-200/90 shadow-sm text-slate-700 flex items-center justify-center transition active:scale-95 group"
                              title="Swap Departure and Arrival Airport"
                            >
                              <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition duration-300" />
                            </button>
                          </div>

                          {/* Arrival Airport */}
                          <div className="md:col-span-6 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 transition">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                                Arrival Airport / Destination
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomFlightDest(!isCustomFlightDest)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                              >
                                {isCustomFlightDest ? "← Pick from 60+ Airports" : "+ Type Custom Airport"}
                              </button>
                            </div>

                            {isCustomFlightDest ? (
                              <input
                                type="text"
                                value={flightDestAirport}
                                onChange={(e) => {
                                  setFlightDestAirport(e.target.value.toUpperCase());
                                  handleUpdateFlightRoute(flightOriginAirport, e.target.value.toUpperCase());
                                }}
                                placeholder="e.g. DEL, GOX, MAA, HYD, SXR, COK, DXB..."
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none uppercase"
                              />
                            ) : (
                              <select
                                value={flightDestAirport}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomFlightDest(true);
                                  } else {
                                    handleUpdateFlightRoute(flightOriginAirport, e.target.value);
                                  }
                                }}
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                              >
                                {INDIAN_AIRPORTS.map((a) => (
                                  <option key={`dest-air-${a.code}`} value={a.code}>
                                    {a.city} — {a.name} ({a.code}) [{a.state}]
                                  </option>
                                ))}
                                <option value="CUSTOM">[+] Type Custom Airport Code / City...</option>
                              </select>
                            )}
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="truncate">
                                {INDIAN_AIRPORTS.find((a) => a.code.toUpperCase() === flightDestAirport.toUpperCase())?.city || currentRouteObj.destination}
                              </span>
                              <span className="font-semibold text-sky-700 shrink-0 ml-1 tabular-nums">
                                {currentRouteObj.distanceKm} km aerial track
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date, Cabin Class & Travelers Grid for Flights */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Travel Date */}
                          <div className="md:col-span-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Departure Date
                            </label>
                            <input
                              type="date"
                              value={departureDate}
                              onChange={(e) => setDepartureDate(e.target.value)}
                              className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums"
                            />
                            <span className="text-[11px] text-sky-700 font-semibold tabular-nums mt-1">
                              {prediction.daysUntilDeparture} days prior to departure • Golden Window Active
                            </span>
                          </div>

                          {/* Cabin Class */}
                          <div className="md:col-span-5 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Cabin Class & Fare Category
                            </label>
                            <select
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none truncate cursor-pointer"
                            >
                              {currentRouteObj.classes.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Airline revenue bucket pricing with machine learning demand forecasting
                            </div>
                          </div>

                          {/* Trip Type & Travelers */}
                          <div className="md:col-span-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Trip & Passengers
                            </label>
                            <div className="flex items-center justify-between gap-2">
                              <select
                                value={tripType}
                                onChange={(e) => setTripType(e.target.value as "One Way" | "Round Trip")}
                                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                              >
                                <option value="One Way">One Way</option>
                                <option value="Round Trip">Round Trip</option>
                              </select>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                                <input
                                  type="number"
                                  min={1}
                                  max={9}
                                  value={travelers}
                                  onChange={(e) => setTravelers(Math.max(1, Math.min(9, Number(e.target.value))))}
                                  className="w-10 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs font-bold tabular-nums"
                                />
                                <span>Pax</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-sky-600 font-semibold mt-1">
                              {tripType === "Round Trip" ? "Round-trip ticket planned" : "Single journey air ticket"}
                            </div>
                          </div>
                        </div>

                        {/* Aerial Telemetry HUD Strip */}
                        {flightTelemetry && (
                          <div className="bg-gradient-to-r from-sky-50 via-blue-50/60 to-sky-50 border border-sky-200/90 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white/80 p-2.5 rounded-xl border border-sky-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                                ✈️ Aerial Distance
                              </span>
                              <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                                {flightTelemetry.distanceKm} km
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                via Direct ATC Great Circle
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-sky-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                                ⏱️ Flying Time
                              </span>
                              <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                                ~{flightTelemetry.durationText}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Cruising at ~{flightTelemetry.avgSpeedKmh} km/h
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-sky-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                                🏷️ Economy Base Fare
                              </span>
                              <span className="font-display text-base font-bold text-sky-700 tabular-nums">
                                ₹{flightTelemetry.baseFareEconomy.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-sky-600 block">
                                DGCA market baseline
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-sky-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                                🌿 Jet-A1 Emissions
                              </span>
                              <span className="font-display text-base font-bold text-blue-700 tabular-nums">
                                {flightTelemetry.co2Kg} kg CO₂
                              </span>
                              <span className="text-[10px] text-blue-600 block">
                                Estimated fuel burn per pax
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Quick Popular Domestic & International Flight Corridors Pills */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>🛫</span>
                              <span>Popular Domestic & International Flight Corridors:</span>
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Click any corridor for instant IATA route parameters
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "Mumbai ⇄ Delhi (IndiGo / Air India)", from: "BOM", to: "DEL" },
                              { label: "Bangalore ⇄ Mumbai (Business Express)", from: "BLR", to: "BOM" },
                              { label: "Delhi ⇄ Goa Mopa (Holiday Direct)", from: "DEL", to: "GOX" },
                              { label: "Mumbai ⇄ Goa Dabolim", from: "BOM", to: "GOI" },
                              { label: "Bangalore ⇄ Delhi", from: "BLR", to: "DEL" },
                              { label: "Chennai ⇄ Delhi", from: "MAA", to: "DEL" },
                              { label: "Kolkata ⇄ Delhi", from: "CCU", to: "DEL" },
                              { label: "Hyderabad ⇄ Mumbai", from: "HYD", to: "BOM" },
                              { label: "Delhi ⇄ Srinagar (Scenic Kashmir)", from: "DEL", to: "SXR" },
                              { label: "Mumbai ⇄ Kochi (Kerala Direct)", from: "BOM", to: "COK" },
                              { label: "Delhi ⇄ Ayodhya (Maharishi Valmiki)", from: "DEL", to: "AYJ" },
                              { label: "Mumbai ⇄ Dubai (Emirates / Air India)", from: "BOM", to: "DXB" },
                              { label: "Delhi ⇄ London Heathrow (Direct)", from: "DEL", to: "LHR" },
                              { label: "Mumbai ⇄ Singapore Changi", from: "BOM", to: "SIN" },
                            ].map((pill) => {
                              const isActive =
                                (flightOriginAirport.toUpperCase() === pill.from.toUpperCase() &&
                                  flightDestAirport.toUpperCase() === pill.to.toUpperCase()) ||
                                (flightOriginAirport.toUpperCase() === pill.to.toUpperCase() &&
                                  flightDestAirport.toUpperCase() === pill.from.toUpperCase());
                              return (
                                <button
                                  key={pill.label}
                                  type="button"
                                  onClick={() => handleUpdateFlightRoute(pill.from, pill.to)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                    isActive
                                      ? "bg-sky-600 text-white shadow-sm ring-2 ring-sky-400"
                                      : "bg-slate-100 hover:bg-sky-100/70 text-slate-700 hover:text-sky-900 border border-slate-200/60"
                                  }`}
                                >
                                  {pill.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : selectedMode === "railway" ? (
                      /* ================= RAILWAYS: ANY STATION TO ANY STATION (INDIAN RAILWAYS) ================= */
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                              <Train className="w-4 h-4 text-emerald-600" />
                              Indian Railways National Grid (Any Station to Any Station • All 18 Zones)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Pick from 70+ major junctions or type any station code/city in India
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Boarding Station */}
                          <div className="md:col-span-5 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 transition">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                Boarding Station / Terminal
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomRailOrigin(!isCustomRailOrigin)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                              >
                                {isCustomRailOrigin ? "← Pick from 70+ Stations" : "+ Type Custom Station"}
                              </button>
                            </div>

                            {isCustomRailOrigin ? (
                              <input
                                type="text"
                                value={railOriginStation}
                                onChange={(e) => {
                                  setRailOriginStation(e.target.value.toUpperCase());
                                  handleUpdateRailRoute(e.target.value.toUpperCase(), railDestStation);
                                }}
                                placeholder="e.g. CSMT, NDLS, PUNE, BSB, AY, SBC..."
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none uppercase"
                              />
                            ) : (
                              <select
                                value={railOriginStation}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomRailOrigin(true);
                                  } else {
                                    handleUpdateRailRoute(e.target.value, railDestStation);
                                  }
                                }}
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                              >
                                {INDIAN_RAIL_STATIONS.map((s) => (
                                  <option key={`orig-rail-${s.code}`} value={s.code}>
                                    {s.name} ({s.code}) — {s.state} [{s.division || s.zone || "IR"}]
                                  </option>
                                ))}
                                <option value="CUSTOM">[+] Type Custom Station Code / Junction...</option>
                              </select>
                            )}
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="truncate">
                                {INDIAN_RAIL_STATIONS.find((s) => s.code.toUpperCase() === railOriginStation.toUpperCase())?.division || "IR Broad Gauge"} Electrified Hub
                              </span>
                              <span className="font-semibold text-emerald-700 shrink-0 ml-1">
                                0 km
                              </span>
                            </div>
                          </div>

                          {/* Swap Boarding & Destination Button */}
                          <div className="md:col-span-1 flex items-center justify-center -my-2 md:my-0">
                            <button
                              type="button"
                              onClick={handleSwapRailStations}
                              className="w-10 h-10 rounded-full bg-white hover:bg-emerald-600 hover:text-white border border-slate-200/90 shadow-sm text-slate-700 flex items-center justify-center transition active:scale-95 group"
                              title="Swap Boarding and Destination Station"
                            >
                              <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition duration-300" />
                            </button>
                          </div>

                          {/* Destination Station */}
                          <div className="md:col-span-6 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 transition">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                                Destination Station / Terminal
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomRailDest(!isCustomRailDest)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                              >
                                {isCustomRailDest ? "← Pick from 70+ Stations" : "+ Type Custom Station"}
                              </button>
                            </div>

                            {isCustomRailDest ? (
                              <input
                                type="text"
                                value={railDestStation}
                                onChange={(e) => {
                                  setRailDestStation(e.target.value.toUpperCase());
                                  handleUpdateRailRoute(railOriginStation, e.target.value.toUpperCase());
                                }}
                                placeholder="e.g. MAO, HWH, SBC, ADI, SVDK, AGC..."
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none uppercase"
                              />
                            ) : (
                              <select
                                value={railDestStation}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomRailDest(true);
                                  } else {
                                    handleUpdateRailRoute(railOriginStation, e.target.value);
                                  }
                                }}
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                              >
                                {INDIAN_RAIL_STATIONS.map((s) => (
                                  <option key={`dest-rail-${s.code}`} value={s.code}>
                                    {s.name} ({s.code}) — {s.state} [{s.division || s.zone || "IR"}]
                                  </option>
                                ))}
                                <option value="CUSTOM">[+] Type Custom Station Code / Junction...</option>
                              </select>
                            )}
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="truncate">
                                {INDIAN_RAIL_STATIONS.find((s) => s.code.toUpperCase() === railDestStation.toUpperCase())?.name || currentRouteObj.destination}
                              </span>
                              <span className="font-semibold text-emerald-700 shrink-0 ml-1 tabular-nums">
                                {currentRouteObj.distanceKm} km track
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date, Class & Travelers Grid for Railways */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Travel Date */}
                          <div className="md:col-span-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Date of Journey
                            </label>
                            <input
                              type="date"
                              value={departureDate}
                              onChange={(e) => setDepartureDate(e.target.value)}
                              className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums"
                            />
                            <span className="text-[11px] text-emerald-700 font-semibold tabular-nums mt-1">
                              {prediction.daysUntilDeparture} days prior • ARP 120 Days Active
                            </span>
                          </div>

                          {/* Travel Class / Quota */}
                          <div className="md:col-span-5 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Travel Class / Accommodation
                            </label>
                            <select
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none truncate cursor-pointer"
                            >
                              {currentRouteObj.classes.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Statutory telescopic distance fare with flexi-quota surge
                            </div>
                          </div>

                          {/* Trip Type & Travelers */}
                          <div className="md:col-span-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Trip & Passengers
                            </label>
                            <div className="flex items-center justify-between gap-2">
                              <select
                                value={tripType}
                                onChange={(e) => setTripType(e.target.value as "One Way" | "Round Trip")}
                                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                              >
                                <option value="One Way">One Way</option>
                                <option value="Round Trip">Round Trip</option>
                              </select>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                                <input
                                  type="number"
                                  min={1}
                                  max={9}
                                  value={travelers}
                                  onChange={(e) => setTravelers(Math.max(1, Math.min(9, Number(e.target.value))))}
                                  className="w-10 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs font-bold tabular-nums"
                                />
                                <span>Pax</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                              {tripType === "Round Trip" ? "Round-trip journey planned" : "Single journey ticket"}
                            </div>
                          </div>
                        </div>

                        {/* Rail Track Telemetry HUD Strip */}
                        {railTelemetry && (
                          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                🚆 Track Distance
                              </span>
                              <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                                {railTelemetry.distanceKm} km
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                via IR Broad Gauge
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                ⏱️ Running Time
                              </span>
                              <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                                ~{railTelemetry.durationText}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Avg ~{railTelemetry.avgSpeedKmh} km/h + halts
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                🎫 3A Base Tariff
                              </span>
                              <span className="font-display text-base font-bold text-emerald-700 tabular-nums">
                                ₹{railTelemetry.baseFare3A.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-emerald-600 block">
                                IRCTC telescopic fare
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                                🌿 Electric Traction
                              </span>
                              <span className="font-display text-base font-bold text-teal-700 tabular-nums">
                                {railTelemetry.co2Kg} kg CO₂
                              </span>
                              <span className="text-[10px] text-teal-600 block">
                                85% lower vs flight
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Quick Iconic Indian Railways Corridors Pills */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>🇮🇳</span>
                              <span>Iconic Vande Bharat, Rajdhani & Shatabdi Corridors:</span>
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Click any corridor for instant IRCTC track parameters
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "CSMT ⇄ Goa Madgaon (Vande Bharat)", from: "CSMT", to: "MAO" },
                              { label: "Mumbai Central ⇄ New Delhi (Tejas Rajdhani)", from: "MMCT", to: "NDLS" },
                              { label: "CSMT ⇄ Pune (Deccan Queen)", from: "CSMT", to: "PUNE" },
                              { label: "New Delhi ⇄ Varanasi (Vande Bharat)", from: "NDLS", to: "BSB" },
                              { label: "New Delhi ⇄ Ayodhya Dham (Vande Bharat)", from: "NDLS", to: "AY" },
                              { label: "Bangalore KSR ⇄ Hyderabad KCG", from: "SBC", to: "KCG" },
                              { label: "Bangalore ⇄ Mysore (Vande Bharat)", from: "SBC", to: "MYS" },
                              { label: "Chennai Central ⇄ Bangalore (Shatabdi)", from: "MAS", to: "SBC" },
                              { label: "Ahmedabad ⇄ Mumbai Central (Vande Bharat)", from: "ADI", to: "MMCT" },
                              { label: "New Delhi ⇄ Amritsar (Shatabdi)", from: "NDLS", to: "ASR" },
                              { label: "Howrah ⇄ Puri (Vande Bharat)", from: "HWH", to: "PURI" },
                              { label: "New Delhi ⇄ Agra Cantt (Gatimaan 160)", from: "NDLS", to: "AGC" },
                              { label: "Guwahati ⇄ New Jalpaiguri (Vande Bharat)", from: "GHY", to: "NJP" },
                              { label: "Hazrat Nizamuddin ⇄ Goa Madgaon (Rajdhani)", from: "NZM", to: "MAO" },
                            ].map((pill) => {
                              const isActive =
                                (railOriginStation.toUpperCase() === pill.from.toUpperCase() &&
                                  railDestStation.toUpperCase() === pill.to.toUpperCase()) ||
                                (railOriginStation.toUpperCase() === pill.to.toUpperCase() &&
                                  railDestStation.toUpperCase() === pill.from.toUpperCase());
                              return (
                                <button
                                  key={pill.label}
                                  type="button"
                                  onClick={() => handleUpdateRailRoute(pill.from, pill.to)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                    isActive
                                      ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400"
                                      : "bg-slate-100 hover:bg-emerald-100/70 text-slate-700 hover:text-emerald-900 border border-slate-200/60"
                                  }`}
                                >
                                  {pill.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : selectedMode === "roadway" ? (
                      /* ================= ROADWAYS: ANYWHERE IN INDIA (BUSES & CABS) ================= */
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                              <Car className="w-4 h-4 text-amber-600" />
                              Anywhere in India Overland Travel (Door-to-Door Cabs & Intercity Buses)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Pick any two cities or towns across India for live road tolls & fares
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Pick-up City / Town */}
                          <div className="md:col-span-5 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 transition">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                Origin / Pick-up City
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomRoadOrigin(!isCustomRoadOrigin)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                              >
                                {isCustomRoadOrigin ? "← Pick from 60+ Cities" : "+ Type Custom Town"}
                              </button>
                            </div>

                            {isCustomRoadOrigin ? (
                              <input
                                type="text"
                                value={roadOriginCity}
                                onChange={(e) => {
                                  setRoadOriginCity(e.target.value);
                                  handleUpdateRoadRoute(e.target.value, roadDestCity);
                                }}
                                placeholder="e.g. Lonavala, Alibaug, Shirdi, Thane..."
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none"
                              />
                            ) : (
                              <select
                                value={roadOriginCity}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomRoadOrigin(true);
                                  } else {
                                    handleUpdateRoadRoute(e.target.value, roadDestCity);
                                  }
                                }}
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                              >
                                {INDIAN_ROAD_CITIES.map((c) => (
                                  <option key={`orig-${c.id}`} value={c.name}>
                                    {c.name} ({c.state})
                                  </option>
                                ))}
                                <option value="CUSTOM">[+] Type Custom City/Town...</option>
                              </select>
                            )}
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="truncate">
                                {INDIAN_ROAD_CITIES.find((c) => c.name.toLowerCase() === roadOriginCity.toLowerCase())?.hubDesc || "Doorstep Chauffeur Pickup"}
                              </span>
                              <span className="font-semibold text-amber-700 shrink-0 ml-1">
                                0 km
                              </span>
                            </div>
                          </div>

                          {/* Swap Origin & Destination Button */}
                          <div className="md:col-span-1 flex items-center justify-center -my-2 md:my-0">
                            <button
                              type="button"
                              onClick={handleSwapRoadCities}
                              className="w-10 h-10 rounded-full bg-white hover:bg-amber-500 hover:text-white border border-slate-200/90 shadow-sm text-slate-700 flex items-center justify-center transition active:scale-95 group"
                              title="Swap Origin and Destination"
                            >
                              <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition duration-300" />
                            </button>
                          </div>

                          {/* Drop-off City / Town */}
                          <div className="md:col-span-6 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 transition">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                                Destination / Drop-off City
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomRoadDest(!isCustomRoadDest)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                              >
                                {isCustomRoadDest ? "← Pick from 60+ Cities" : "+ Type Custom Town"}
                              </button>
                            </div>

                            {isCustomRoadDest ? (
                              <input
                                type="text"
                                value={roadDestCity}
                                onChange={(e) => {
                                  setRoadDestCity(e.target.value);
                                  handleUpdateRoadRoute(roadOriginCity, e.target.value);
                                }}
                                placeholder="e.g. Pune, Goa, Mahabaleshwar, Agra..."
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none"
                              />
                            ) : (
                              <select
                                value={roadDestCity}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomRoadDest(true);
                                  } else {
                                    handleUpdateRoadRoute(roadOriginCity, e.target.value);
                                  }
                                }}
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                              >
                                {INDIAN_ROAD_CITIES.map((c) => (
                                  <option key={`dest-${c.id}`} value={c.name}>
                                    {c.name} ({c.state})
                                  </option>
                                ))}
                                <option value="CUSTOM">[+] Type Custom City/Town...</option>
                              </select>
                            )}
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="truncate">
                                {INDIAN_ROAD_CITIES.find((c) => c.name.toLowerCase() === roadDestCity.toLowerCase())?.hubDesc || "Doorstep Chauffeur Drop"}
                              </span>
                              <span className="font-semibold text-blue-600 shrink-0 ml-1 tabular-nums">
                                {currentRouteObj.distanceKm} km route
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date, Class & Travelers Grid for Roadways */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Travel Date */}
                          <div className="md:col-span-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Travel Date
                            </label>
                            <input
                              type="date"
                              value={departureDate}
                              onChange={(e) => setDepartureDate(e.target.value)}
                              className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums"
                            />
                            <span className="text-[11px] text-blue-600 font-semibold tabular-nums mt-1">
                              {prediction.daysUntilDeparture} days prior to journey
                            </span>
                          </div>

                          {/* Class / Vehicle Tier */}
                          <div className="md:col-span-5 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Vehicle & Travel Class
                            </label>
                            <select
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none truncate cursor-pointer"
                            >
                              {currentRouteObj.classes.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {selectedClass.includes("Cab") || selectedClass.includes("Sedan") || selectedClass.includes("SUV")
                                ? "Dedicated Private AC Chauffeur Car"
                                : "Intercity Sleeper / Seater Coach"}
                            </div>
                          </div>

                          {/* Trip Type & Travelers */}
                          <div className="md:col-span-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                              Trip & Passengers
                            </label>
                            <div className="flex items-center justify-between gap-2">
                              <select
                                value={tripType}
                                onChange={(e) => setTripType(e.target.value as "One Way" | "Round Trip")}
                                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                              >
                                <option value="One Way">One Way</option>
                                <option value="Round Trip">Round Trip</option>
                              </select>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                                <input
                                  type="number"
                                  min={1}
                                  max={9}
                                  value={travelers}
                                  onChange={(e) => setTravelers(Math.max(1, Math.min(9, Number(e.target.value))))}
                                  className="w-10 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs font-bold tabular-nums"
                                />
                                <span>Pax</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                              {tripType === "Round Trip" ? "Round-trip discount applied" : "One-way dynamic tariff"}
                            </div>
                          </div>
                        </div>

                        {/* Highway Telemetry Strip */}
                        {highwayTelemetry && (
                          <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/90 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                                🛣️ Road Distance
                              </span>
                              <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                                {highwayTelemetry.distanceKm} km
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                via NH / Expressway
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                                ⏱️ Driving Time
                              </span>
                              <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                                ~{highwayTelemetry.durationText}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Average 58 km/h + break
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                💳 FASTag Tolls
                              </span>
                              <span className="font-display text-base font-bold text-emerald-700 tabular-nums">
                                ₹{highwayTelemetry.fastagToll.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-emerald-600 block">
                                Included in fares
                              </span>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                                ⛽ Fuel vs EV Cost
                              </span>
                              <span className="font-display text-xs font-bold text-slate-900 tabular-nums block">
                                Fuel: ₹{highwayTelemetry.fuelPetrolDiesel.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-blue-600 tabular-nums block">
                                EV: ₹{highwayTelemetry.fuelEv.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Quick Highway Expressways Pills */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>🏎️</span>
                              <span>Popular Expressways & Door-to-Door Highway Corridors:</span>
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Click any corridor to load instant route details
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "Mumbai ⇄ Pune (148 km)", from: "Mumbai", to: "Pune" },
                              { label: "Mumbai ⇄ Nashik (165 km)", from: "Mumbai", to: "Nashik" },
                              { label: "Mumbai ⇄ Shirdi (Samruddhi)", from: "Mumbai", to: "Shirdi" },
                              { label: "Bangalore ⇄ Mysore (10-Lane)", from: "Bangalore", to: "Mysore" },
                              { label: "Delhi ⇄ Jaipur (275 km)", from: "Delhi", to: "Jaipur" },
                              { label: "Delhi ⇄ Agra (Yamuna Exp)", from: "Delhi", to: "Agra" },
                              { label: "Pune ⇄ Goa (460 km)", from: "Pune", to: "Goa (Panjim)" },
                              { label: "Ahmedabad ⇄ Surat (NE-1)", from: "Ahmedabad", to: "Surat" },
                              { label: "Chennai ⇄ Pondicherry (ECR)", from: "Chennai", to: "Pondicherry" },
                              { label: "Chandigarh ⇄ Shimla (Himalayan)", from: "Chandigarh", to: "Shimla" },
                              { label: "Hyderabad ⇄ Vijayawada", from: "Hyderabad", to: "Vijayawada" },
                              { label: "Mumbai ⇄ Kolhapur (380 km)", from: "Mumbai", to: "Kolhapur" },
                            ].map((pill) => {
                              const isActive =
                                (roadOriginCity.toLowerCase().includes(pill.from.toLowerCase()) &&
                                  roadDestCity.toLowerCase().includes(pill.to.toLowerCase())) ||
                                (roadOriginCity.toLowerCase().includes(pill.to.toLowerCase()) &&
                                  roadDestCity.toLowerCase().includes(pill.from.toLowerCase()));
                              return (
                                <button
                                  key={pill.label}
                                  type="button"
                                  onClick={() => handleUpdateRoadRoute(pill.from, pill.to)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                    isActive
                                      ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-400"
                                      : "bg-slate-100 hover:bg-amber-100/70 text-slate-700 hover:text-amber-900 border border-slate-200/60"
                                  }`}
                                >
                                  {pill.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ================= STANDARD AIRWAY, RAILWAY & WATERWAY FORM ================= */
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Origin & Corridor */}
                        <div className="md:col-span-5 bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/80 rounded-2xl p-4 transition">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Origin ({MODE_META[selectedMode].hubLabel}) & Corridor
                          </label>
                          <select
                            value={currentRouteObj.id}
                            onChange={(e) => handleSelectRoute(e.target.value)}
                            className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                          >
                            {modeRoutes.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.origin} → {r.destination}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between">
                            <span className="font-code text-[11px]">
                              Code: {currentRouteObj.originCode}
                            </span>
                            <span className="font-semibold text-blue-600 tabular-nums">
                              {currentRouteObj.distanceKm} km distance
                            </span>
                          </div>
                        </div>

                        {/* Destination Summary */}
                        <div className="md:col-span-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Arrival {MODE_META[selectedMode].hubLabel}
                          </span>
                          <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {currentRouteObj.destination}
                          </div>
                          <div className="text-xs text-emerald-600 font-semibold tabular-nums">
                            Est. {currentRouteObj.durationHrs} hrs • {currentRouteObj.co2KgPerPax} kg CO₂
                          </div>
                        </div>

                        {/* Departure Date */}
                        <div className="md:col-span-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Departure Date
                          </label>
                          <input
                            type="date"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums"
                          />
                          <span className="text-[11px] text-blue-600 font-semibold tabular-nums">
                            {prediction.daysUntilDeparture} days prior
                          </span>
                        </div>

                        {/* Class & Travelers */}
                        <div className="md:col-span-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Cabin / Tier
                          </label>
                          <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none truncate cursor-pointer"
                          >
                            {currentRouteObj.classes.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center justify-between mt-1">
                            <select
                              value={tripType}
                              onChange={(e) =>
                                setTripType(e.target.value as "One Way" | "Round Trip")
                              }
                              className="bg-transparent text-[11px] font-semibold text-slate-600 focus:outline-none"
                            >
                              <option value="One Way">One Way</option>
                              <option value="Round Trip">Round Trip</option>
                            </select>
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-900">
                              <input
                                type="number"
                                min={1}
                                max={9}
                                value={travelers}
                                onChange={(e) =>
                                  setTravelers(Math.max(1, Math.min(9, Number(e.target.value))))
                                }
                                className="w-10 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs font-bold tabular-nums"
                              />
                              <span>Pax</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Indian Railways Dynamic Class Matrix */}
                    {selectedMode === "railway" && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                            <Train className="w-3.5 h-3.5 text-emerald-700" />
                            Indian Railways Dynamic Class Fare Matrix
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium hidden sm:inline">
                            Click any class to re-calculate ML prediction instantly
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                          {currentRouteObj.classes.map((cls) => {
                            const isSelected = selectedClass === cls.name;
                            const estFare = Math.round(
                              currentRouteObj.baseFare *
                                cls.multiplier *
                                (tripType === "Round Trip" ? 1.88 : 1.0) *
                                travelers
                            );
                            const shortCode = cls.name.includes("(")
                              ? cls.name.match(/\((.*?)\)/)?.[1] || cls.name
                              : cls.name.split(" ")[0];

                            return (
                              <button
                                key={cls.name}
                                type="button"
                                onClick={() => setSelectedClass(cls.name)}
                                className={`p-2 rounded-xl border text-left transition ${
                                  isSelected
                                    ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-2 ring-emerald-500/50"
                                    : "bg-white hover:bg-emerald-50 border-emerald-200/60 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`font-code text-xs font-bold ${
                                      isSelected ? "text-emerald-300" : "text-emerald-700"
                                    }`}
                                  >
                                    {shortCode}
                                  </span>
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  )}
                                </div>
                                <div
                                  className={`text-[10px] truncate font-medium mt-0.5 ${
                                    isSelected ? "text-slate-300" : "text-slate-500"
                                  }`}
                                >
                                  {cls.name.split(" (")[0]}
                                </div>
                                <div
                                  className={`text-xs font-bold tabular-nums font-display mt-0.5 ${
                                    isSelected ? "text-white" : "text-slate-900"
                                  }`}
                                >
                                  ₹{estFare.toLocaleString("en-IN")}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Search & Forecast CTA Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Popular Corridors:</span>
                        {[
                          { label: "Mumbai → Delhi", id: "air-bom-del" },
                          { label: "CSMT → Goa Vande Bharat", id: "rail-bom-goa" },
                          { label: "Bangalore → Hyderabad Volvo", id: "road-blr-hyd" },
                          { label: "Mumbai → Mandwa Ro-Ro", id: "water-bom-mandwa" },
                          { label: "Andaman Havelock Catamaran", id: "water-ixz-hvl" },
                        ].map((q) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleSelectRoute(q.id)}
                            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shrink-0 border border-slate-200/80"
                          title="Reset search fields to initial defaults"
                        >
                          <Compass className="w-3.5 h-3.5 text-slate-500" />
                          <span>↻ Reset Filters</span>
                        </button>
                        <button
                          type="submit"
                          className="flex-1 sm:flex-initial px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition shrink-0"
                        >
                          <Search className="w-4 h-4" />
                          Predict {MODE_META[selectedMode].shortLabel} Fares
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* ================= MAIN CONTENT BELOW HERO ================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 pb-14">
              {/* 1. ML FARE FORECAST CHART + SMART BOOKING ADVISOR */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 8 Cols: 30-Day Historical + Future Forecast Chart */}
                <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-1">
                        <Navigation className="w-3.5 h-3.5" />
                        30-Day Fare Horizon & Golden Booking Window
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {currentRouteObj.origin} → {currentRouteObj.destination} ({selectedClass})
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold tabular-nums">
                        ML Confidence: {prediction.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={prediction.forecastSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="dateLabel" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "14px",
                            color: "#0f172a",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                          }}
                        />
                        <Legend />
                        <ReferenceLine
                          x={prediction.forecastSeries.find((p) => p.type === "today")?.dateLabel}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          label={{ value: "Today", fill: "#d97706", fontSize: 11, fontWeight: "bold" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="upperBound"
                          name="95% Confidence Band"
                          stroke="none"
                          fill="#2563eb"
                          fillOpacity={0.08}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          name="Predicted / Historical Fare (₹)"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#2563eb" }}
                          activeDot={{ r: 5, fill: "#0f172a" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="lowerBound"
                          name="Sweet-Spot Floor (₹)"
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Live Travel Conditions Strip */}
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                      <span className="text-slate-400 font-medium block">Seat/Berth Occupancy</span>
                      <span className="text-slate-900 font-bold text-sm">
                        {Math.round(prediction.liveStreamMeta.demandSurge * 100)}% Booked
                      </span>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                      <span className="text-slate-400 font-medium block">Travel Demand</span>
                      <span className="text-amber-600 font-bold text-sm">
                        {prediction.liveStreamMeta.seasonalityTag}
                      </span>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                      <span className="text-slate-400 font-medium block">Route Conditions</span>
                      <span className="text-emerald-600 font-bold text-sm">
                        {prediction.liveStreamMeta.weatherStatus.split(":")[0]}
                      </span>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                      <span className="text-slate-400 font-medium block">Sweet-Spot Window</span>
                      <span className="text-blue-600 font-bold text-sm">
                        {currentRouteObj.optimalLeadDays[0]}–{currentRouteObj.optimalLeadDays[1]} Days Out
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Smart Booking Advisor */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-blue-600" />
                        Smart Booking Advisor
                      </span>
                      <span className="text-xs font-medium text-slate-500 tabular-nums">
                        {prediction.daysUntilDeparture}d before trip
                      </span>
                    </div>

                    {/* Verdict Banner */}
                    <div
                      className={`p-4 rounded-2xl border mb-4 ${
                        prediction.recommendation === "WAIT TO BOOK"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                        Recommended Action
                      </div>
                      <div className="font-display text-xl font-bold mt-0.5 flex items-center gap-2">
                        {prediction.recommendation === "WAIT TO BOOK" ? (
                          <TrendingDown className="w-5 h-5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                        {prediction.recommendation}
                      </div>
                    </div>

                    {/* Fare Comparison Boxes */}
                    <div className="grid grid-cols-2 gap-3 mb-4 tabular-nums">
                      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                        <div className="text-xs font-medium text-slate-500">Current Fare</div>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">
                          ₹{(prediction.currentLowestFare * travelers).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {travelers} {travelers === 1 ? "traveler" : "travelers"}
                        </div>
                      </div>
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
                        <div className="text-xs font-semibold text-emerald-700">Predicted Floor</div>
                        <div className="text-xl font-bold text-emerald-700 mt-0.5">
                          ₹{(prediction.predictedLowestFare * travelers).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Best: {prediction.optimalBookingDate}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      {prediction.reasoning}
                    </p>

                    {/* Factor Impact Breakdown */}
                    <div className="mt-4 space-y-2 tabular-nums">
                      <div className="text-xs font-semibold text-slate-900">
                        Pricing Factor Attribution:
                      </div>
                      {prediction.factorImpacts.map((f) => (
                        <div
                          key={f.factor}
                          className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/50"
                        >
                          <span className="text-slate-700 font-medium truncate pr-2">
                            {f.factor}
                          </span>
                          <span
                            className={`font-bold shrink-0 ${
                              f.impactPct > 0
                                ? "text-rose-600"
                                : f.impactPct < 0
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            {f.impactPct > 0 ? `+${f.impactPct}%` : `${f.impactPct}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => setBookingModalOffer(prediction.offers[0])}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition duration-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Book Now on Official Partner
                    </button>
                    <button
                      onClick={() => handleCreateAlert(prediction.offers[0])}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition duration-200"
                    >
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      Set Alert at ₹{prediction.predictedLowestFare.toLocaleString("en-IN")}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. BOARDING-PASS STYLE CARRIER TICKETS & REAL-TIME STREAM */}
              <div className="space-y-4">
                {/* Real-time Telemetry Stream Banner */}
                <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex items-center justify-center">
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${
                          isLiveFeedActive ? "bg-emerald-500 animate-ping" : "bg-slate-500"
                        } opacity-75`}
                      />
                      <span
                        className={`absolute w-2.5 h-2.5 rounded-full ${
                          isLiveFeedActive ? "bg-emerald-400" : "bg-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          REAL-TIME SATELLITE & GDS FARE TELEMETRY
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {isLiveFeedActive ? "Live (5s Pulses)" : "Feed Paused"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{liveWeatherInfo}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Last Sync: {lastLiveSyncTime}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fetchLiveRates(true)}
                      disabled={isSyncingLive}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 text-amber-300 ${isSyncingLive ? "animate-spin" : ""}`}
                      />
                      <span>{isSyncingLive ? "Syncing..." : "Sync Live Rates"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLiveFeedActive(!isLiveFeedActive);
                        triggerToast(
                          isLiveFeedActive
                            ? "Live telemetry feed paused"
                            : "Live telemetry feed resumed (5s pulses)"
                        );
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        isLiveFeedActive
                          ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {isLiveFeedActive ? "Pause Feed" : "Resume Feed"}
                    </button>
                  </div>
                </div>

                {liveTickerNotice && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{liveTickerNotice}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                      {getModeIcon(selectedMode, "w-6 h-6")}
                      Available {MODE_META[selectedMode].label} Options
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live real-time rates & ML predicted sweet-spot fares for {departureDate}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("compare")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100/70 bg-blue-50 border border-blue-200/80 px-4 py-2.5 rounded-xl transition"
                  >
                    Compare Air, Rail, Road & Sea for this trip
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Roadway Vehicle Filter Bar */}
                {selectedMode === "roadway" && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Filter Road Fleet:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "all", label: "All Vehicles (Buses & Cabs)" },
                        { id: "sleeper", label: "🛏️ AC Sleeper Buses (RedBus/Zingbus)" },
                        { id: "rtc", label: "🏛️ State RTC Express (MSRTC/KSRTC/RSRTC)" },
                        { id: "cab_sedan", label: "🚗 AC Sedan Cabs (Dzire/Etios)" },
                        { id: "cab_suv", label: "🚙 AC SUV Cabs (Innova Crysta)" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setRoadVehicleFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            roadVehicleFilter === tab.id
                              ? "bg-slate-900 text-white shadow-sm ring-2 ring-amber-400"
                              : "bg-white hover:bg-amber-100/70 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {displayedOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="ticket-card bg-white border border-slate-200/80 hover:border-blue-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.07)]"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Operator Info */}
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                            {getModeIcon(offer.mode, "w-6 h-6")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-display text-lg font-bold text-slate-900">
                                {offer.carrierName}
                              </span>
                              <span className="font-code text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                                {offer.carrierCode}
                              </span>
                              {offer.badge && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold">
                                  {offer.badge}
                                </span>
                              )}
                              {offer.deltaType === "drop" && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 animate-pulse">
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  -₹{Math.abs(offer.priceDelta || 0)} Live Drop
                                </span>
                              )}
                              {offer.deltaType === "surge" && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                                  <TrendingDown className="w-3.5 h-3.5 rotate-180" />
                                  +₹{offer.priceDelta} Surge
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
                              {offer.extraInfo} • Occupancy: {offer.occupancyPct}%
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {offer.amenities.map((am) => (
                                <span
                                  key={am}
                                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/70 text-slate-600 font-medium"
                                >
                                  {am}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Boarding Pass Route Timeline */}
                        <div className="flex items-center justify-center gap-6 bg-slate-50/80 px-6 py-3.5 rounded-2xl border border-slate-200/70 tabular-nums">
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-900">
                              {offer.depTime}
                            </div>
                            <div className="font-code text-xs font-semibold text-slate-500">
                              {currentRouteObj.originCode}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {offer.durationText}
                            </span>
                            <div className="w-24 h-0.5 bg-blue-600/30 my-1.5 relative" />
                            <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                              Direct {MODE_META[offer.mode].unitName}
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-900">
                              {offer.arrTime}
                            </div>
                            <div className="font-code text-xs font-semibold text-slate-500">
                              {currentRouteObj.destinationCode}
                            </div>
                          </div>
                        </div>

                        {/* Price & Booking Actions */}
                        <div className="flex sm:items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-dashed border-slate-200 tabular-nums">
                          <div className="text-left lg:text-right">
                            <div className="text-xs font-medium text-slate-400">
                              Live Fare
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                              ₹{(offer.currentFare * travelers).toLocaleString("en-IN")}
                            </div>
                            <div className="text-xs text-emerald-600 font-semibold">
                              ML Target: ₹{(offer.predictedLowFare * travelers).toLocaleString("en-IN")}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setBookingModalOffer(offer)}
                              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition duration-200"
                            >
                              <span>Book on Partner</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleBookOffer(offer)}
                                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] shadow-sm transition duration-200"
                              >
                                Lock ML Fare
                              </button>
                              <button
                                onClick={() => handleCreateAlert(offer)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-[11px] transition"
                              >
                                Alert
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Multi-Provider Price Matrix Strip */}
                      {offer.providerQuotes && offer.providerQuotes.length > 0 && (
                        <div className="pt-3.5 border-t border-slate-100">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <ExternalLink className="w-3 h-3 text-blue-600" />
                              Live Provider Rates (Pre-Filled Route & Date)
                            </span>
                            <span className="text-emerald-600 font-semibold lowercase">
                              direct prefilled link
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {offer.providerQuotes.map((quote) => (
                              <a
                                key={quote.providerId}
                                href={quote.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/item bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-400 rounded-xl p-2.5 transition flex flex-col justify-between"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-800 group-hover/item:text-blue-600 truncate">
                                    {quote.providerName.split(" ")[0]}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover/item:text-blue-600 shrink-0" />
                                </div>
                                <div className="mt-1 flex items-baseline justify-between tabular-nums">
                                  <span className="text-xs font-bold text-slate-900 font-display">
                                    ₹{(quote.price * travelers).toLocaleString("en-IN")}
                                  </span>
                                  {quote.isBestPrice && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                      Best
                                    </span>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. TRENDING SCENIC DESTINATIONS & MULTI-MODAL GETAWAYS */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                      Curated Multi-Modal Journeys
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Popular Destinations Across Air, Rail, Road & Sea
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {FEATURED_DESTINATIONS.map((dest) => (
                    <div
                      key={dest.title}
                      onClick={() => {
                        handleSelectRoute(dest.routeId);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        triggerToast(`Loaded ${dest.title} forecast!`);
                      }}
                      className="cursor-pointer group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition"
                    >
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={dest.image}
                          alt={dest.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-semibold shadow-sm">
                          {dest.tag}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="font-display text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {dest.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{dest.subtitle}</div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between tabular-nums">
                          <span className="text-xs text-slate-400 font-medium">
                            Predicted from
                          </span>
                          <span className="text-base font-bold text-emerald-600">
                            ₹{dest.startingFare.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 2. TRAVELER HUB / DASHBOARD VIEW ----------------- */}
        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            {/* Sleek Carbon Welcome Banner */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-400">
                  Personal Travel Hub
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                  Welcome back, {currentUser.name}
                </h1>
                <p className="text-sm text-slate-300 mt-0.5">{currentUser.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
                >
                  + Plan a New Journey
                </button>
                <button
                  onClick={() => {
                    setCurrentUser({
                      name: "Guest",
                      fullName: "Guest Traveler",
                      email: "guest@omnifare.ai",
                      isGuest: true,
                    });
                    setActiveTab("login");
                    triggerToast("Signed out successfully");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Recent Searches Table + Saved Bucket List Trips */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Cols: Recent Searches */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Multi-Modal Searches
                  </h2>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(["all", "airway", "railway", "roadway", "waterway"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setDashboardModeFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          dashboardModeFilter === f
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {f === "all" ? "All Modes" : MODE_META[f].shortLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse tabular-nums">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Corridor & Mode</th>
                        <th className="py-3 px-2">Departure</th>
                        <th className="py-3 px-2">Current Fare</th>
                        <th className="py-3 px-2">ML Floor</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filteredRecentSearches.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-2 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              {getModeIcon(item.mode)}
                              <span>{item.routeCode}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-slate-600 font-medium">
                            {new Date(item.travelDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-2 font-bold text-slate-900">
                            ₹{item.lowestPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="font-bold text-emerald-600">
                              ₹{item.predictedLow.toLocaleString("en-IN")}
                            </span>
                            <span
                              className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                item.verdict === "WAIT"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {item.verdict}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => {
                                handleSelectRoute(item.routeId);
                                setDepartureDate(item.travelDate);
                                setActiveTab("search");
                              }}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 4 Cols: Saved Bucket List Trips */}
              <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-200">
                    Saved Travel Watchlist
                  </h2>

                  <div className="divide-y divide-slate-100 mt-2 tabular-nums">
                    {savedTrips.map((trip) => (
                      <div key={trip.id} className="py-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            {trip.title}
                          </span>
                          {getModeIcon(trip.mode)}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {trip.routeCode}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center justify-between">
                          <span>{trip.dateText}</span>
                          <span className="text-emerald-600 font-bold">
                            Target: ₹{trip.targetPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => {
                              handleSelectRoute(trip.routeId);
                              setTravelers(trip.travelers);
                              setActiveTab("search");
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            View Forecast
                          </button>
                          <button
                            onClick={() => {
                              setSavedTrips((prev) => prev.filter((t) => t.id !== trip.id));
                              triggerToast(`Removed "${trip.title}"`);
                            }}
                            className="py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {showSaveModal ? (
                  <div className="mt-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <input
                      type="text"
                      value={newTripTitle}
                      onChange={(e) => setNewTripTitle(e.target.value)}
                      placeholder="Trip title (e.g., Winter Retreat)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTrip}
                        className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                      >
                        Save Watchlist
                      </button>
                      <button
                        onClick={() => setShowSaveModal(false)}
                        className="py-2 px-3 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="mt-4 w-full py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs shadow-sm transition duration-200"
                  >
                    + Save Current Route to Watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 3. COMPARE ALL 4 MODES VIEW ----------------- */}
        {activeTab === "compare" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <CrossModeComparator
              onSelectRoute={(mode, routeId) => {
                handleSelectMode(mode);
                handleSelectRoute(routeId);
                setActiveTab("search");
              }}
            />
          </div>
        )}

        {/* ----------------- 5. MY BOOKINGS & PRICE ALERTS VIEW ----------------- */}
        {activeTab === "bookings" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Confirmed Itineraries & Locked Fares
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                All your reserved Flights, Trains, Sleeper Coaches, and Ferries/Cruises in one place.
              </p>

              <div className="space-y-4 tabular-nums">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="ticket-card bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                        {getModeIcon(bk.mode, "w-6 h-6")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 text-lg">
                            {bk.origin} → {bk.destination}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                            {bk.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          {bk.carrierName} ({bk.carrierCode}) • Class: {bk.travelClass} • PNR:{" "}
                          <span className="font-code text-blue-600 font-semibold">{bk.pnr}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Departure: {bk.travelDate} at {bk.depTime} • {bk.travelers} Traveler(s)
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        ₹{bk.amountPaid.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold">
                        Saved ₹{bk.mlSaved.toLocaleString("en-IN")} with OmniFare ML
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Price Drop Alerts */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Active Price Freeze & Drop Alerts
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Instant notifications when fares enter your ML-recommended booking window.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tabular-nums">
                {priceAlerts.map((al) => (
                  <div
                    key={al.id}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        {getModeIcon(al.mode, "w-5 h-5")}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {al.routeLabel}
                        </div>
                        <div className="text-xs text-slate-500">
                          {al.carrierName} • Date: {al.travelDate}
                        </div>
                        <div className="text-xs text-emerald-600 font-semibold mt-1">
                          Target: ₹{al.targetFare.toLocaleString("en-IN")} (Now: ₹
                          {al.currentFare.toLocaleString("en-IN")}) • Drop Prob: {al.probability}%
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setPriceAlerts((prev) => prev.filter((item) => item.id !== al.id))
                      }
                      className="text-slate-400 hover:text-rose-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 6. LOGIN / PROFILE SWITCHER VIEW ----------------- */}
        {activeTab === "login" && (
          <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm mb-4">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Sign In to OmniFare
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Access your curated multi-modal itineraries and fare alerts
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const found = TEAM_MEMBERS.find(
                    (m) => m.email.toLowerCase() === loginEmail.toLowerCase()
                  );
                  setCurrentUser({
                    name: found ? found.name : loginEmail.split("@")[0],
                    fullName: found ? found.name : loginEmail.split("@")[0],
                    email: loginEmail,
                    isGuest: false,
                  });
                  setActiveTab("search");
                  triggerToast(`Welcome back, ${found ? found.name : loginEmail}`);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition"
                >
                  Sign In to Account
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 text-center mb-2.5">
                  Quick Profile Login:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {TEAM_MEMBERS.map((m) => (
                    <button
                      key={m.roll}
                      type="button"
                      onClick={() => {
                        setLoginEmail(m.email);
                        setCurrentUser({
                          name: m.name,
                          fullName: m.name,
                          email: m.email,
                          isGuest: false,
                        });
                        setActiveTab("search");
                        triggerToast(`Signed in as ${m.name}`);
                      }}
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-xs flex items-center justify-between transition"
                    >
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      <span className="font-code text-blue-600 text-[11px]">{m.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 6. ABOUT & ENTERPRISE SECURITY VIEW ----------------- */}
        {activeTab === "help" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  Enterprise Travel Intelligence
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Zero Markup Guarantee</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-display">
                OmniFare: Multi-Modal Travel Fare Prediction Using ML
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                Engineered for travelers, commuters, and mobility planners. Unifies real-time statutory tariffs,
                market advance booking window curves, live satellite weather radar, and pre-filled direct carrier reservations
                across <span className="text-slate-900 font-semibold">Airways, Indian Railways, Intercity Roadways, and Coastal Waterways</span>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5">
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Direct Official Checkout
                  </div>
                  <div className="text-base font-bold text-slate-900 mb-1">
                    Zero Middleman Markup Policy
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    OmniFare links directly to official operators—including IndiGo, Air India, IRCTC Next-Gen,
                    ConfirmTkt, RedBus, and M2M Ferries—with origin, destination, date, and cabin classes pre-filled.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5">
                  <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    Golden Booking Horizon
                  </div>
                  <div className="text-base font-bold text-slate-900 mb-1">
                    Advance Window Price Forecasting
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evaluates multi-day lead-time price elasticity up to 49 days in advance, advising whether
                    current fares are at their historical floor or likely to drop within the optimal booking window.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5">
                  <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-700" />
                    Security & Data Integrity
                  </div>
                  <div className="text-base font-bold text-slate-900 mb-1">
                    Enterprise Privacy & Encryption
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Strict zero-knowledge passenger credential handling. Deep links and session telemetry are
                    secured using TLS 1.3 standards with direct banking and official gateway checkouts.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-800">Platform Leadership:</span>{" "}
                  Harshal Patil (Lead Systems Architect & Engineer) •{" "}
                  <span className="font-code text-blue-600">hp0198349@gmail.com</span>
                </div>
                <div className="font-medium text-slate-400">
                  Department of Information Technology • Production Release v2.4
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Live Official Partner Booking Modal */}
      <BookingPartnerModal
        isOpen={!!bookingModalOffer}
        onClose={() => setBookingModalOffer(null)}
        offer={bookingModalOffer}
        route={currentRouteObj}
        travelDate={departureDate}
        travelClass={selectedClass}
        travelers={travelers}
        onLockOmniFareFare={handleBookOffer}
      />
    </div>
  );
}
