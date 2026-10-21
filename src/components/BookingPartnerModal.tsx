"use client";

import React from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plane,
  Train,
  Bus,
  Ship,
  Lock,
} from "lucide-react";
import { CarrierOffer, RouteDefinition, TransportMode } from "@/lib/fareEngine";
import {
  generateBookingPartners,
  BookingPartnerOption,
} from "@/lib/bookingRedirects";

interface BookingPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CarrierOffer | null;
  route: RouteDefinition;
  travelDate: string;
  travelClass: string;
  travelers: number;
  onLockOmniFareFare: (offer: CarrierOffer) => void;
}

export default function BookingPartnerModal({
  isOpen,
  onClose,
  offer,
  route,
  travelDate,
  travelClass,
  travelers,
  onLockOmniFareFare,
}: BookingPartnerModalProps) {
  if (!isOpen || !offer) return null;

  const partners: BookingPartnerOption[] = generateBookingPartners(
    offer.mode,
    route,
    travelDate,
    travelClass,
    travelers,
    offer.carrierCode,
    offer.carrierName,
    offer.currentFare
  );

  const getModeIcon = (mode: TransportMode) => {
    if (mode === "airway") return <Plane className="w-5 h-5 text-blue-600" />;
    if (mode === "railway") return <Train className="w-5 h-5 text-emerald-600" />;
    if (mode === "roadway") return <Bus className="w-5 h-5 text-amber-600" />;
    return <Ship className="w-5 h-5 text-cyan-600" />;
  };

  const handleOpenPartner = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const totalCurrentFare = offer.currentFare * travelers;
  const totalPredictedFare = offer.predictedLowFare * travelers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
              {getModeIcon(offer.mode)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-slate-900">
                  {offer.carrierName}
                </span>
                <span className="font-code text-xs px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                  {offer.carrierCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {route.origin} → {route.destination} • {travelDate} ({travelClass}) • {travelers} Pax
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Fare Summary Box */}
          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 tabular-nums">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block">
                Target Booking Price
              </span>
              <div className="text-2xl font-bold font-display text-slate-900 mt-0.5">
                ₹{totalCurrentFare.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-500 ml-1.5">
                  (₹{offer.currentFare.toLocaleString("en-IN")}/pax)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-700 block">
                ML Predicted Floor
              </span>
              <span className="text-sm font-bold text-emerald-700">
                ₹{totalPredictedFare.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Confidence: {Math.round(offer.confidence)}%
              </span>
            </div>
          </div>

          {/* Pre-Filled Parameters Verification Checklist */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pre-Filled Parameters Bound to Booking URL
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Origin</span>
                <span className="font-bold text-slate-900 truncate block">
                  {route.origin.split(" (")[0]}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Destination</span>
                <span className="font-bold text-slate-900 truncate block">
                  {route.destination.split(" (")[0]}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Travel Date</span>
                <span className="font-bold text-slate-900 tabular-nums block">{travelDate}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Class & Pax</span>
                <span className="font-bold text-slate-900 truncate block">
                  {travelClass} • {travelers} Pax
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Live External Booking Channels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-display text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  Live External Booking Channels (Direct Pre-Filled Search)
                </h4>
                <p className="text-xs text-slate-500">
                  Clicking opens the provider portal with all your route, date, and passenger details pre-selected.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="group bg-white hover:bg-blue-50/30 border border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm hover:shadow"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                        {partner.name}
                      </span>
                      {partner.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {partner.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      {partner.tagline}
                    </p>
                    {partner.features && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {partner.features.map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-slate-600"
                          >
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-right tabular-nums">
                      <div className="text-[10px] text-slate-400">Live Quote</div>
                      <div className="font-bold text-slate-900 text-base font-display">
                        ₹{partner.estimatedPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenPartner(partner.url)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <span>Book on Partner</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: OmniFare Guaranteed Instant Fare Lock */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-display text-sm font-bold text-slate-900">
                    OmniFare Instant Itinerary Pass
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Lock today&apos;s predicted fare with an instant PNR and simulated price protection.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                0% Convenience Fee
              </span>
            </div>

            <button
              onClick={() => {
                onLockOmniFareFare(offer);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lock Fare & Issue OmniFare PNR (Saved to Traveler Hub)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Verified live redirects to official airline, IRCTC, RedBus, and cruise portals.
          </span>
        </div>
      </div>
    </div>
  );
}
