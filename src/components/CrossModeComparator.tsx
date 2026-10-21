"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Plane,
  Train,
  Bus,
  Ship,
  Clock,
  Leaf,
  Compass,
  ArrowRight,
  Award,
  MapPin,
} from "lucide-react";
import {
  CORRIDORS,
  compareCorridorModes,
  TransportMode,
} from "@/lib/fareEngine";

interface Props {
  onSelectRoute: (mode: TransportMode, routeId: string) => void;
}

export default function CrossModeComparator({ onSelectRoute }: Props) {
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0].id);
  const [travelDate, setTravelDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [travelers, setTravelers] = useState(1);

  const items = useMemo(
    () => compareCorridorModes(selectedCorridor, travelDate, travelers),
    [selectedCorridor, travelDate, travelers]
  );

  const activeCorridorObj =
    CORRIDORS.find((c) => c.id === selectedCorridor) || CORRIDORS[0];

  const getModeBadge = (m: TransportMode) => {
    if (m === "airway")
      return {
        icon: <Plane className="w-5 h-5 text-blue-600" />,
        bg: "bg-blue-50 border-blue-100",
        btn: "bg-slate-900 hover:bg-blue-600",
      };
    if (m === "railway")
      return {
        icon: <Train className="w-5 h-5 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-100",
        btn: "bg-slate-900 hover:bg-emerald-600",
      };
    if (m === "roadway")
      return {
        icon: <Bus className="w-5 h-5 text-amber-600" />,
        bg: "bg-amber-50 border-amber-100",
        btn: "bg-slate-900 hover:bg-amber-600",
      };
    return {
      icon: <Ship className="w-5 h-5 text-cyan-600" />,
      bg: "bg-cyan-50 border-cyan-100",
      btn: "bg-slate-900 hover:bg-cyan-600",
    };
  };

  const chartData = items.map((item) => ({
    name: item.modeLabel.split(" ")[0],
    "Current Fare (₹)": item.currentFare * travelers,
    "ML Predicted Low (₹)": item.predictedLowFare * travelers,
    "CO2 Emissions (kg)": item.co2Kg * travelers,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              Multi-Modal Corridor Intelligence • Air, Rail, Road & Sea
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Compare All 4 Modes for Your Journey
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-3xl">
              Evaluate flying, Vande Bharat/Rajdhani rail, luxury sleeper coaches, and coastal cruises side-by-side on fare, time, comfort, and carbon footprint.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Travel Corridor
            </label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Departure Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Passengers
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Traveler" : "Travelers"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{activeCorridorObj.description}</span>
        </div>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {items.map((item) => {
          const totalCur = item.currentFare * travelers;
          const totalLow = item.predictedLowFare * travelers;
          const savings = Math.max(0, totalCur - totalLow);
          const style = getModeBadge(item.mode);

          return (
            <div
              key={item.routeId}
              className="bg-white border border-slate-200/80 hover:border-blue-500/40 rounded-3xl p-6 flex flex-col justify-between transition shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border ${style.bg}`}>
                      {style.icon}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {item.modeLabel}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {item.carrierHighlight}
                      </div>
                    </div>
                  </div>
                </div>

                {item.verdictBadge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-4">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    {item.verdictBadge}
                  </div>
                )}

                <div className="bg-slate-50/90 rounded-2xl p-4 mb-4 border border-slate-200/60 tabular-nums">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-slate-500">Current Fare</span>
                    <span className="text-2xl font-bold text-slate-900">
                      ₹{totalCur.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-xs font-semibold text-emerald-600">ML Predicted Low</span>
                    <span className="text-sm font-bold text-emerald-600">
                      ₹{totalLow.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="text-[11px] text-blue-600 mt-1.5 font-semibold">
                      Save ₹{savings.toLocaleString("en-IN")} at optimal booking window
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Journey Time
                    </span>
                    <span className="font-semibold text-slate-900">{item.durationText}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Eco Footprint
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {item.co2Kg * travelers} kg CO₂
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Traveler Comfort</span>
                    <span className="font-semibold text-slate-900">
                      {item.comfortScore}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Smart Verdict</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                      {item.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectRoute(item.mode, item.routeId)}
                className={`mt-6 w-full py-3 px-4 rounded-xl ${style.btn} text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition duration-200`}
              >
                Explore {item.modeLabel.split(" ")[0]} Forecast
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bar Chart Comparing Modes */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Multi-Modal Fare vs. ML Predicted Low Comparison
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Side-by-side comparison of current booking fares vs. ML-predicted floor prices across all available transport modes.
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
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
              <Bar
                dataKey="Current Fare (₹)"
                fill="#0f172a"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="ML Predicted Low (₹)"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
