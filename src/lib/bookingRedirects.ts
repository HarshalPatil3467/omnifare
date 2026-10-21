import { TransportMode, RouteDefinition } from "./fareEngine";

export interface BookingPartnerOption {
  id: string;
  name: string;
  tagline: string;
  type: "official" | "aggregator" | "meta";
  badge?: string;
  logoUrl?: string;
  url: string;
  estimatedPrice: number;
  features: string[];
}

export function generateBookingPartners(
  mode: TransportMode,
  route: RouteDefinition,
  travelDate: string,
  travelClass: string,
  travelers: number,
  carrierCode?: string,
  carrierName?: string,
  baseCalculatedFare: number = 0,
  tripType: "One Way" | "Round Trip" = "One Way"
): BookingPartnerOption[] {
  const [year, month, day] = travelDate.split("-");
  const formattedDateDDMMYYYY = `${day}-${month}-${year}`;

  const cleanCity = (text: string) => {
    return text.split("(")[0].trim().toLowerCase().replace(/\s+/g, "-");
  };

  const origCity = cleanCity(route.origin);
  const destCity = cleanCity(route.destination);
  const effectiveBase = baseCalculatedFare > 0 ? baseCalculatedFare : route.baseFare;

  // 1. AIRWAYS
  if (mode === "airway") {
    const isBusiness = travelClass.toLowerCase().includes("business");
    const isPremiumEco = travelClass.toLowerCase().includes("premium");
    const cabinCode = isBusiness ? "B" : isPremiumEco ? "W" : "E";
    const cabinQuery = isBusiness ? "business" : isPremiumEco ? "premium%20economy" : "economy";
    const roundTripFlag = tripType === "Round Trip" ? "round-trip" : "one-way";

    // Google Flights full deep search with exact query parameters
    const googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${route.originCode}%20to%20${route.destinationCode}%20on%20${travelDate}%20${cabinQuery}%20${travelers}%20passengers%20${roundTripFlag}&curr=INR`;

    // EaseMyTrip deep search
    const easeMyTripUrl = `https://www.easemytrip.com/flight-search/${route.originCode}-${route.destinationCode}-${travelDate}-${travelers}-0-0?class=${cabinCode}`;

    // MakeMyTrip full itinerary search
    const mmtUrl = `https://www.makemytrip.com/flight/search?itinerary=${route.originCode}-${route.destinationCode}-${travelDate}&tripType=${tripType === "Round Trip" ? "R" : "O"}&paxType=A-${travelers}_C-0_I-0&intl=false&cabinClass=${cabinCode}`;

    // Skyscanner India deep link
    const skyscannerDate = `${year.slice(2)}${month}${day}`;
    const skyscannerUrl = `https://www.skyscanner.co.in/transport/flights/${route.originCode.toLowerCase()}/${route.destinationCode.toLowerCase()}/${skyscannerDate}/?adultsv2=${travelers}&cabinclass=${isBusiness ? "business" : "economy"}&rtn=0`;

    const partners: BookingPartnerOption[] = [
      {
        id: "google-flights",
        name: "Google Flights",
        tagline: "Live airline fare matrix with seat selection & historical price tracking",
        type: "meta",
        badge: "Official Live Search",
        url: googleFlightsUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["IATA Airport Codes", "Travel Class Bound", "Live Seat Map Preview"],
      },
      {
        id: "easemytrip",
        name: "EaseMyTrip",
        tagline: "Zero convenience fee booking portal with instant PNR confirmation",
        type: "aggregator",
        badge: "Zero Convenience Fee",
        url: easeMyTripUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["No Convenience Charges", "Instant Refund Option", "Direct GDS Sync"],
      },
      {
        id: "makemytrip-flights",
        name: "MakeMyTrip Flights",
        tagline: "Pre-filled passenger cabin with instant boarding pass issuance",
        type: "aggregator",
        badge: "Instant Seat Lock",
        url: mmtUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Flight Guarantee", "Meal Pre-Selection", "Trip Insurance Included"],
      },
      {
        id: "skyscanner",
        name: "Skyscanner",
        tagline: "Global multi-GDS fare aggregator comparing 100+ travel agencies",
        type: "meta",
        badge: "Global Fare Compare",
        url: skyscannerUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Real-time GDS Sync", "Flexible Date Search", "Multi-OTA Rate Matrix"],
      },
    ];

    // Airline Official Portals
    if (carrierName?.toLowerCase().includes("indigo") || carrierCode?.startsWith("6E")) {
      partners.unshift({
        id: "indigo-official",
        name: "IndiGo Airlines Official (goindigo.in)",
        tagline: "Direct 6E booking with lowest web fares and pre-booked XL seats",
        type: "official",
        badge: "Official Airline Direct",
        url: `https://www.goindigo.in/#booking?origin=${route.originCode}&destination=${route.destinationCode}&departureDate=${travelDate}&pax=${travelers}&class=${cabinCode}`,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Direct Airline PNR", "Pre-Book Extra Baggage", "Free Web Check-in 48h prior"],
      });
    } else if (carrierName?.toLowerCase().includes("air india") || carrierCode?.startsWith("AI")) {
      partners.unshift({
        id: "airindia-official",
        name: "Air India Official Portal",
        tagline: "Book direct for Flying Returns Maharaja loyalty miles and complimentary hot meals",
        type: "official",
        badge: "Official Airline Direct",
        url: `https://www.airindia.com/in/en/book/flight-search.html?origin=${route.originCode}&destination=${route.destinationCode}&departureDate=${travelDate}&pax=${travelers}`,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["25kg Checked Baggage", "Flying Returns Miles", "Direct Meal Selection"],
      });
    } else if (carrierName?.toLowerCase().includes("akasa") || carrierCode?.startsWith("QP")) {
      partners.unshift({
        id: "akasa-official",
        name: "Akasa Air Official Portal",
        tagline: "Direct Boeing 737 MAX booking with Cafe Akasa gourmet meals",
        type: "official",
        badge: "Official Airline Direct",
        url: `https://www.akasaair.com/#booking?origin=${route.originCode}&destination=${route.destinationCode}&date=${travelDate}&pax=${travelers}`,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Eco Boeing 737 MAX", "Cafe Akasa Meal Opt", "Zero Extra Booking Fee"],
      });
    }

    return partners;
  }

  // 2. RAILWAYS
  if (mode === "railway") {
    const origStn = route.originCode || "CSMT";
    const destStn = route.destinationCode || "NDLS";

    // Extract Railway class code
    let trainClassCode = "3A";
    if (travelClass.includes("1A") || travelClass.includes("First AC")) trainClassCode = "1A";
    else if (travelClass.includes("2A") || travelClass.includes("2 Tier")) trainClassCode = "2A";
    else if (travelClass.includes("3E") || travelClass.includes("Economy")) trainClassCode = "3E";
    else if (travelClass.includes("CC") || travelClass.includes("Chair Car")) trainClassCode = "CC";
    else if (travelClass.includes("EC") || travelClass.includes("Executive")) trainClassCode = "EC";
    else if (travelClass.includes("SL") || travelClass.includes("Sleeper")) trainClassCode = "SL";
    else if (travelClass.includes("2S") || travelClass.includes("Second")) trainClassCode = "2S";

    const confirmTktUrl = `https://www.confirmtkt.com/rbooking-d/trains/from/${origStn}/to/${destStn}?date=${formattedDateDDMMYYYY}&class=${trainClassCode}&quota=GN`;
    const irctcUrl = `https://www.irctc.co.in/nget/booking/train-list?srcStn=${origStn}&destStn=${destStn}&journeyDate=${formattedDateDDMMYYYY}&quotaCode=GN&classCode=${trainClassCode}`;
    const mmtRailUrl = `https://www.makemytrip.com/railways/listing?src=${origStn}&dest=${destStn}&date=${travelDate}&classCode=${trainClassCode}`;
    const railYatriUrl = `https://www.railyatri.in/time-table/${carrierCode || "trains"}?from=${origStn}&to=${destStn}&date=${formattedDateDDMMYYYY}`;

    return [
      {
        id: "confirmtkt",
        name: "ConfirmTkt (Official IRCTC Partner)",
        tagline: "Live seat availability, Tatkal Quota booking & WL confirmation prediction algorithm",
        type: "aggregator",
        badge: "Live Availability & WL Predictor",
        url: confirmTktUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Exact Station Codes", "Class Code Prefilled", "Tatkal Auto-fill Support"],
      },
      {
        id: "irctc-official",
        name: "IRCTC Next-Gen e-Ticketing System",
        tagline: "Ministry of Railways official government reservation engine",
        type: "official",
        badge: "Official Indian Railways",
        url: irctcUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Zero Agent Markup", "Direct IRCTC PNR", "Official Berths Allocation"],
      },
      {
        id: "makemytrip-trains",
        name: "MakeMyTrip Trains",
        tagline: "Authorized IRCTC partner with Trip Guarantee & free cancellation",
        type: "aggregator",
        badge: "Trip Guarantee Available",
        url: mmtRailUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Train Running Status", "Food on Track Booking", "Instant Refund to Wallet"],
      },
      {
        id: "railyatri",
        name: "RailYatri Smart Train Portal",
        tagline: "Live train timetable, platform locator & berth layout engine",
        type: "aggregator",
        badge: "Platform & Layouts",
        url: railYatriUrl,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Coach Position Preview", "Platform Number Alerts", "Station E-Catering"],
      },
    ];
  }

  // 3. ROADWAYS (Buses & Cabs: Anywhere in India)
  if (mode === "roadway") {
    const isSleeper = travelClass.toLowerCase().includes("sleeper");
    const busTypeParam = isSleeper ? "sleeper" : "seater";
    const isCabOption =
      travelClass.toLowerCase().includes("cab") ||
      travelClass.toLowerCase().includes("sedan") ||
      travelClass.toLowerCase().includes("suv") ||
      carrierName?.toLowerCase().includes("cab") ||
      carrierName?.toLowerCase().includes("sedan") ||
      carrierName?.toLowerCase().includes("suv") ||
      carrierName?.toLowerCase().includes("savaari") ||
      carrierName?.toLowerCase().includes("makemytrip");

    const extractCityName = (text: string) => {
      const raw = text.split("(")[0].split("/")[0].trim();
      return raw || text.trim();
    };
    const origName = extractCityName(route.origin);
    const destName = extractCityName(route.destination);
    const origSlug = origName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const destSlug = destName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const mmtCabUrl = `https://www.makemytrip.com/cabs/outstation-one-way-${origSlug}-${destSlug}.html`;
    const savaariUrl = `https://www.savaari.com/cab-booking?from=${encodeURIComponent(origName)}&to=${encodeURIComponent(destName)}&pickup_date=${travelDate}`;
    const redbusUrl = `https://www.redbus.in/bus-tickets/${origSlug}-to-${destSlug}?fromCityName=${encodeURIComponent(origName)}&toCityName=${encodeURIComponent(destName)}&onward=${travelDate}&busType=${busTypeParam}`;
    const abhibusUrl = `https://www.abhibus.com/bus_search/${origSlug}/${destSlug}/${travelDate}`;
    const zingbusUrl = `https://www.zingbus.com/bus-tickets/${origSlug}-to-${destSlug}?journeyDate=${travelDate}`;

    const cabEstimatedFare = Math.max(1200, Math.round(effectiveBase));
    const busEstimatedFare = Math.round(effectiveBase * travelers);

    const cabPartners: BookingPartnerOption[] = [
      {
        id: "mmt-outstation-cab",
        name: "MakeMyTrip Outstation Cabs",
        tagline: "Dedicated doorstep AC Sedan/SUV with verified chauffeur and all highway toll charges included",
        type: "official",
        badge: "Door-to-Door Private Cab",
        url: mmtCabUrl,
        estimatedPrice: cabEstimatedFare,
        features: ["Doorstep Pickup & Drop", "Toll & State Tax Included", "Zero Waiting Charges", "Sanitized AC Fleet"],
      },
      {
        id: "savaari-cabs",
        name: "Savaari Car Rentals",
        tagline: "India's premier intercity chauffeur car rental service with AC Dzire, Etios & Innova Crysta",
        type: "aggregator",
        badge: "Top Chauffeur Service",
        url: savaariUrl,
        estimatedPrice: Math.round(cabEstimatedFare * 1.05),
        features: ["All-India Commercial Permit", "Verified Highway Drivers", "Zero Cancellation Charges", "Luggage Carrier"],
      },
    ];

    const busPartners: BookingPartnerOption[] = [
      {
        id: "redbus-official",
        name: "RedBus Official",
        tagline: "Official live seat layouts, live GPS tracking & boarding point selector",
        type: "official",
        badge: "Official Live Search",
        url: redbusUrl,
        estimatedPrice: busEstimatedFare,
        features: ["Live Seat Selection", "GPS Track My Bus", "Verified Intercity Fleet", "Overnight Sleepers"],
      },
      {
        id: "abhibus",
        name: "AbhiBus",
        tagline: "Direct RTC government corporations (MSRTC, KSRTC, TSRTC, RSRTC) & private luxury Volvos",
        type: "aggregator",
        badge: "RTC & Private Coaches",
        url: abhibusUrl,
        estimatedPrice: busEstimatedFare,
        features: ["State Roadways Included", "Instant Ticket on WhatsApp", "Free Reschedule"],
      },
      {
        id: "zingbus",
        name: "Zingbus Electric & Luxury Fleet",
        tagline: "Premium verified intercity lounges with guaranteed on-time departures",
        type: "official",
        badge: "Premium Lounges",
        url: zingbusUrl,
        estimatedPrice: busEstimatedFare,
        features: ["Premium Waiting Lounges", "Live Female Seat Filter", "Zero Cancellation Charges"],
      },
    ];

    return isCabOption ? [...cabPartners, ...busPartners] : [...busPartners, ...cabPartners];
  }

  // 4. WATERWAYS (Ferries & Cruises)
  if (route.id.includes("mandwa") || route.id.includes("alibaug")) {
    return [
      {
        id: "m2m-ferries",
        name: "M2M Ferries Official (Bhaucha Dhakka ⇄ Mandwa)",
        tagline: "Official Ro-Ro Car & Passenger Catamaran booking portal with pre-selected tide timings",
        type: "official",
        badge: "Official Ro-Ro Portal",
        url: `https://m2mferries.com/booking/?origin=Mumbai&destination=Mandwa&date=${travelDate}&passengers=${travelers}`,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Vehicle + Pax Booking", "Air-conditioned Lounges", "Pet-Friendly Ferry"],
      },
      {
        id: "myboat-ride",
        name: "MyBoatRide Mumbai Speedboats",
        tagline: "Gateway of India speedboats & AC catamarans to Alibaug Mandwa Jetty",
        type: "aggregator",
        badge: "Fast Sea Crossing",
        url: `https://myboatride.com/?from=Gateway&to=Mandwa&date=${travelDate}&pax=${travelers}`,
        estimatedPrice: Math.max(250, Math.round(effectiveBase * 0.95 * travelers)),
        features: ["45-min Fast Transit", "Multiple Hourly Departures", "Instant Mobile Barcode"],
      },
    ];
  }

  if (route.id.includes("goa")) {
    return [
      {
        id: "cordelia-cruises",
        name: "Cordelia Cruises Official Portal (MV Empress)",
        tagline: "Luxury 11-deck ocean liner from Mumbai International Cruise Terminal to Goa Mormugao",
        type: "official",
        badge: "Official Ocean Liner",
        url: `https://www.cordeliacruises.com/itinerary?destination=Goa&departurePort=Mumbai&travelers=${travelers}&date=${travelDate}`,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["All Meals & Shows Included", "Ocean-view & Balcony Cabins", "Casino & Deck Pools"],
      },
      {
        id: "angriya-cruises",
        name: "Angriya Domestic Cruise Liner",
        tagline: "Iconic Konkan coastal voyage with 7 passenger decks and underwater lounges",
        type: "official",
        badge: "Coastal Voyage",
        url: `https://angriyacruises.com/booking?date=${travelDate}&pax=${travelers}`,
        estimatedPrice: Math.round(effectiveBase * 0.96 * travelers),
        features: ["Infinity Pool Onboard", "Konkan Coastal Route", "Starlight Deck Experience"],
      },
    ];
  }

  if (route.id.includes("hvl") || route.id.includes("ixz")) {
    return [
      {
        id: "makruzz-andaman",
        name: "Makruzz High-Speed Andaman Catamarans",
        tagline: "Official AC catamaran between Port Blair Phoenix Bay, Havelock Swaraj Dweep & Neil Island",
        type: "official",
        badge: "Official Andaman Ferry",
        url: `https://www.makruzz.com/booking?from=Port%20Blair&to=Havelock&date=${travelDate}&passengers=${travelers}`,
        estimatedPrice: Math.round(effectiveBase * travelers),
        features: ["Premium & Deluxe Lounges", "90-min High Speed Transit", "Luggage Tagging Included"],
      },
      {
        id: "nautika-ferry",
        name: "Nautika & Green Ocean Ferries",
        tagline: "Luxury Australian-designed catamaran with open viewing deck across Andaman waters",
        type: "official",
        badge: "Open Viewing Deck",
        url: `https://gonautika.com/booking?from=Port%20Blair&to=Havelock&date=${travelDate}&pax=${travelers}`,
        estimatedPrice: Math.round(effectiveBase * 0.98 * travelers),
        features: ["Twin-Hull Stability", "Live Island Music", "Scenic Sun Deck Access"],
      },
    ];
  }

  // Default Waterway (Hazira–Ghogha Ro-Pax)
  return [
    {
      id: "dg-ferry",
      name: "DG Sea Connect Ro-Pax (Gulf of Khambhat)",
      tagline: "Official Hazira (Surat) to Ghogha (Bhavnagar) vehicle & passenger ferry",
      type: "official",
      badge: "Official Ro-Pax Portal",
      url: `https://dgferry.com/booking?origin=Hazira&destination=Ghogha&date=${travelDate}&passengers=${travelers}`,
      estimatedPrice: Math.round(effectiveBase * travelers),
      features: ["Saves 350km Road Travel", "Truck/Car Transit", "Cafeteria on Board"],
    },
  ];
}
