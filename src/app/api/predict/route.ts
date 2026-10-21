import { NextRequest, NextResponse } from "next/server";
import {
  compareCorridorModes,
  generatePrediction,
  MULTI_MODAL_ROUTES,
} from "@/lib/fareEngine";
import mlMetrics from "@/data/ml_model_metrics.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "predict";

  if (action === "metrics") {
    return NextResponse.json({
      status: "ok",
      metrics: mlMetrics,
      routesCount: MULTI_MODAL_ROUTES.length,
    });
  }

  if (action === "compare") {
    const corridorId = searchParams.get("corridorId") || "mumbai-goa";
    const date =
      searchParams.get("date") ||
      new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0];
    const travelers = Number(searchParams.get("travelers") || "1");
    const comparison = compareCorridorModes(corridorId, date, travelers);
    return NextResponse.json({
      status: "ok",
      corridorId,
      date,
      travelers,
      comparison,
    });
  }

  const routeId = searchParams.get("routeId") || "air-bom-del";
  const date =
    searchParams.get("date") ||
    new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0];
  const travelClass = searchParams.get("travelClass") || "Economy";
  const travelers = Number(searchParams.get("travelers") || "1");
  const tripType = (searchParams.get("tripType") as "One Way" | "Round Trip") || "One Way";

  const prediction = generatePrediction(
    routeId,
    date,
    travelClass,
    travelers,
    tripType
  );

  return NextResponse.json({
    status: "ok",
    prediction,
    modelEngine: "FlySmart Hybrid Random Forest + Gradient Boosting v2.1",
  });
}
