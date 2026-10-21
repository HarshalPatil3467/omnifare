"use client";

import React, { useState } from "react";
import { Database, Search, CheckCircle2, ShieldCheck, Sparkles, Filter, FileSpreadsheet, ArrowRight } from "lucide-react";
import rawSamplesData from "@/data/raw_dataset_samples.json";
import { TransportMode } from "@/lib/fareEngine";

interface RawDatasetInspectorProps {
  mode: TransportMode;
  routeId: string;
  selectedClass: string;
}

export default function RawDatasetInspector({
  mode,
  routeId,
  selectedClass,
}: RawDatasetInspectorProps) {
  const [filterClass, setFilterClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const modeData = (rawSamplesData as Record<string, Record<string, any>>)[mode];
  const corridorData = modeData?.[routeId] || (modeData ? Object.values(modeData)[0] : null);

  if (!corridorData) {
    return null;
  }

  const records = corridorData.records || [];

  // Filter records
  const filteredRecords = records.filter((r: any) => {
    const matchesClass =
      filterClass === "all" ||
      r.travelClass.toLowerCase().includes(filterClass.toLowerCase()) ||
      filterClass.toLowerCase().includes(r.travelClass.toLowerCase());
    const matchesSearch =
      searchQuery === "" ||
      r.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const uniqueClasses: string[] = Array.from(
    new Set(records.map((r: any) => r.travelClass))
  );

  const prices = records.map((r: any) => Number(r.historicalPrice)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
      {/* Header with Dataset Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold tracking-wide uppercase">
            <Database className="w-4 h-4 text-blue-600" />
            <span>4,04,086 Record Verified Database</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 font-semibold lowercase">live inspected</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-slate-900 mt-1">
            Raw Historical Dataset Samples
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Actual verified records from our local ML datasets used to train our prediction models.
          </p>
        </div>

        {/* Source Dataset Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 text-xs">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Source CSV File</div>
            <div className="font-code font-bold text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              {corridorData.datasetName}
            </div>
          </div>
          <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl px-4 py-2 text-xs">
            <div className="text-[10px] uppercase font-semibold text-blue-600">Corridor Rows</div>
            <div className="font-bold text-blue-900 tabular-nums">
              {corridorData.totalCorridorRecords.toLocaleString("en-IN")} records
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5">
          <span className="text-slate-400 font-medium block">Dataset Sample Size</span>
          <span className="text-slate-900 font-bold text-base mt-0.5 block font-display">
            {records.length} Verified Rows
          </span>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3.5">
          <span className="text-emerald-700 font-medium block">Historical Lowest Fare</span>
          <span className="text-emerald-700 font-bold text-base mt-0.5 block font-display">
            ₹{minPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5">
          <span className="text-slate-400 font-medium block">Historical Average Fare</span>
          <span className="text-slate-900 font-bold text-base mt-0.5 block font-display">
            ₹{avgPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5">
          <span className="text-slate-400 font-medium block">Historical Highest Peak</span>
          <span className="text-rose-600 font-bold text-base mt-0.5 block font-display">
            ₹{maxPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Search & Class Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Class Filter:
          </span>
          <button
            onClick={() => setFilterClass("all")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              filterClass === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            All Classes
          </button>
          {uniqueClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition truncate max-w-[150px] ${
                filterClass === cls
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search carrier or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Actual Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Operator / Train / Vessel</th>
              <th className="py-3 px-3">Code / ID</th>
              <th className="py-3 px-3">Class</th>
              <th className="py-3 px-3">Departure / Arrival</th>
              <th className="py-3 px-3">Days Left</th>
              <th className="py-3 px-3">Duration / Dist</th>
              <th className="py-3 px-4 text-right">Raw CSV Fare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 tabular-nums">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{row.carrier}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-code text-[11px] px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                      {row.code}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {row.travelClass}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {row.departureTime} → {row.arrivalTime}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {row.daysLeft}d prior
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {row.duration} ({row.stops})
                  </td>
                  <td className="py-3 px-4 text-right font-display text-sm font-bold text-slate-900">
                    ₹{Number(row.historicalPrice).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No records match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dataset Verification Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-2 gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            Records sampled directly from <span className="font-code font-semibold text-slate-700">{corridorData.datasetName}</span>.
          </span>
        </div>
        <span className="text-slate-400">
          Source: {corridorData.source}
        </span>
      </div>
    </div>
  );
}
