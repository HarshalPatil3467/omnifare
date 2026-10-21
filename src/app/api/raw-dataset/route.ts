import { NextRequest, NextResponse } from "next/server";
import rawSamples from "@/data/raw_dataset_samples.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "airway";
  const routeId = searchParams.get("routeId") || "air-bom-del";

  const modeCategory = (rawSamples as Record<string, Record<string, any>>)[mode];
  if (!modeCategory) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const corridorData = modeCategory[routeId] || Object.values(modeCategory)[0];

  return NextResponse.json({
    mode,
    routeId,
    datasetName: corridorData?.datasetName,
    source: corridorData?.source,
    totalCorridorRecords: corridorData?.totalCorridorRecords || 0,
    sampleCount: corridorData?.records?.length || 0,
    records: corridorData?.records || [],
  });
}
