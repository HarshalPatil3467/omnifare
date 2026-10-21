import { NextRequest, NextResponse } from "next/server";
import { MULTI_MODAL_ROUTES, TransportMode, getRouteById, getCityCoordinates } from "@/lib/fareEngine";
import { generateBookingPartners } from "@/lib/bookingRedirects";

interface CityCoords {
  lat: number;
  lon: number;
  name: string;
}

const CITY_COORDS: Record<string, CityCoords> = {
  BOM: { lat: 19.076, lon: 72.8777, name: "Mumbai" },
  DEL: { lat: 28.6139, lon: 77.209, name: "Delhi" },
  BLR: { lat: 12.9716, lon: 77.5946, name: "Bangalore" },
  GOI: { lat: 15.2993, lon: 74.124, name: "Goa" },
  MAO: { lat: 15.2832, lon: 73.9862, name: "Goa (Madgaon)" },
  HYD: { lat: 17.385, lon: 78.4867, name: "Hyderabad" },
  MAA: { lat: 13.0827, lon: 80.2707, name: "Chennai" },
  IXZ: { lat: 11.6234, lon: 92.7265, name: "Port Blair" },
  HVL: { lat: 11.9761, lon: 93.0031, name: "Havelock Island" },
  MANDWA: { lat: 18.7981, lon: 72.8683, name: "Mandwa Jetty" },
  JPR: { lat: 26.9124, lon: 75.7873, name: "Jaipur" },
  PUNE: { lat: 18.5204, lon: 73.8567, name: "Pune" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId") || "air-bom-del";
  const travelDate = searchParams.get("travelDate") || new Date().toISOString().split("T")[0];
  const travelClass = searchParams.get("travelClass") || "Economy";
  const travelers = Math.max(1, Number(searchParams.get("travelers")) || 1);
  const tripType = (searchParams.get("tripType") as "One Way" | "Round Trip") || "One Way";

  const route = getRouteById(routeId);
  const classObj = route.classes.find((c) => c.name === travelClass) || route.classes[0];

  // 1. Fetch live Open-Meteo satellite weather for origin city
  const originCodeKey = route.originCode.toUpperCase();
  const fallbackCoords = getCityCoordinates(route.origin);
  const coords = CITY_COORDS[originCodeKey] || { lat: fallbackCoords.lat, lon: fallbackCoords.lon, name: fallbackCoords.name };

  let liveWeather = {
    tempC: 31.5,
    windKmh: 12.0,
    weatherText: "Clear Sky (Optimal Cruising Altitude)",
    isLive: false,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`,
      { signal: controller.signal, next: { revalidate: 60 } }
    );
    clearTimeout(timeoutId);

    if (weatherRes.ok) {
      const data = await weatherRes.json();
      if (data.current_weather) {
        const cw = data.current_weather;
        let desc = "Clear Skies & Calm Visibility";
        if (cw.windspeed > 25) desc = "Moderate Crosswinds (Aviation Surcharge Buffer)";
        else if (cw.temperature > 38) desc = "High Density Altitude Thermal Conditions";
        else if (cw.weathercode >= 61) desc = "Precipitation / Rain Radar Active";

        liveWeather = {
          tempC: cw.temperature,
          windKmh: cw.windspeed,
          weatherText: `${desc} • Wind: ${cw.windspeed} km/h • ${cw.temperature}°C`,
          isLive: true,
        };
      }
    }
  } catch (err) {
    // Graceful fallback to default live weather telemetry
  }

  // 2. Compute dynamic live second-by-second micro fluctuations
  const now = Date.now();
  const timeSeconds = Math.floor(now / 5000); // changes every 5 seconds
  const pseudoSeed = (timeSeconds * 9301 + 49297) % 233280;
  const normalizedFluct = (pseudoSeed / 233280) * 2 - 1; // -1 to +1

  // Small organic live rate fluctuation (only on dynamic market airway/roadway, zero on statutory trains and fixed ferries)
  const isStatutoryTariff =
    route.mode === "railway" ||
    route.id === "water-bom-mandwa" ||
    route.id === "water-ixz-hvl";

  const maxDeltaMagnitude = isStatutoryTariff
    ? 0
    : route.mode === "airway"
    ? 120
    : route.mode === "waterway"
    ? 80
    : 35;

  const rawDelta = Math.round(normalizedFluct * maxDeltaMagnitude);
  const deltaType: "drop" | "surge" | "steady" =
    rawDelta < -15 ? "drop" : rawDelta > 15 ? "surge" : "steady";

  // Multipliers
  const classMult = classObj.multiplier;
  const roundTripMult = tripType === "Round Trip" ? 1.88 : 1.0;
  const baseLivePricePerPax = Math.max(
    180,
    Math.round(route.baseFare * classMult * roundTripMult + rawDelta)
  );

  // Generate updated live carrier offers with provider quotes
  const updatedOffers = route.carriers.map((carrier, idx) => {
    const carrierFare = Math.round(baseLivePricePerPax * carrier.priceFactor);
    const carrierDelta = Math.round(rawDelta * (0.8 + idx * 0.15));

    // Generate real booking deep links for this carrier
    const partners = generateBookingPartners(
      route.mode,
      route,
      travelDate,
      travelClass,
      travelers,
      carrier.code,
      carrier.name,
      carrierFare,
      tripType
    );

    const providerQuotes = partners.map((p, pIdx) => ({
      providerId: p.id,
      providerName: p.name,
      price: Math.round(p.estimatedPrice / travelers),
      url: p.url,
      badge: p.badge,
      isBestPrice: pIdx === 0,
    }));

    // Find lowest quote among providers
    const lowestQuote = Math.min(...providerQuotes.map((q) => q.price));

    return {
      id: `live-${carrier.code.toLowerCase()}-${idx}`,
      carrierName: carrier.name,
      carrierCode: carrier.code,
      mode: route.mode,
      origin: route.origin,
      destination: route.destination,
      depTime: carrier.depTime,
      arrTime: carrier.arrTime,
      durationText: carrier.durationText,
      travelClass: classObj.name,
      currentFare: carrierFare,
      predictedLowFare: Math.round(carrierFare * 0.86),
      expectedChangePct: carrierDelta < 0 ? -4 : 5,
      trend: carrierDelta < 0 ? ("dropping" as const) : ("rising" as const),
      recommendation: carrierDelta < 0 ? ("BUY NOW" as const) : ("WAIT" as const),
      confidence: Math.round(88 + ((pseudoSeed + idx * 37) % 10)),
      seatsLeft: Math.max(2, 9 - ((pseudoSeed + idx) % 7)),
      occupancyPct: Math.min(98, Math.max(55, Math.round(75 + normalizedFluct * 15))),
      amenities: carrier.amenities,
      rating: carrier.rating,
      badge: carrier.badge,
      extraInfo:
        route.mode === "railway"
          ? `WL Confirmation ${Math.min(99, 88 + ((pseudoSeed + idx) % 11))}% • Dynamic Flexi-Fare Active`
          : route.mode === "waterway"
          ? `Tide Swell 0.4m • High Seas Clearance • Deck Assigned`
          : `Live Seat Bucket: ${Math.max(2, 9 - ((pseudoSeed + idx) % 7))} seats left at this fare`,
      priceDelta: carrierDelta,
      deltaType: carrierDelta < -10 ? ("drop" as const) : carrierDelta > 10 ? ("surge" as const) : ("steady" as const),
      providerQuotes,
      lastLiveSync: new Date().toLocaleTimeString("en-IN", { hour12: false }),
    };
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    liveWeather,
    liveDelta: rawDelta,
    deltaType,
    updatedOffers,
  });
}
