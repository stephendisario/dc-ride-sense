import mapboxgl, { Map, MapMouseEvent, ExpressionSpecification } from "mapbox-gl";
import { H3_9_LAYER_ID } from "./constants";
import { Providers, Snapshot, TimestampSnapshot, ZoneMetrics } from "@shared/types";

export const getMetricByZone = (
  snapshot: Snapshot,
  providers: Providers[],
  metric: keyof ZoneMetrics
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const provider of providers) {
    if (provider === ("TOTAL" as any)) continue;
    const providerZones = snapshot?.[provider] ?? {};

    for (const [zoneId, metrics] of Object.entries(providerZones)) {
      result[zoneId] = (result[zoneId] ?? 0) + metrics[metric];
    }
  }

  return result;
};

export const getHour = (date: string) => {
  return date.slice(11, 13);
};

export const getSnapshotTimestamp = (value: number, snapshot: TimestampSnapshot) => {
  const timestamps = Object.keys(snapshot);

  return timestamps[value];
};

export const sortSnapshotTimestamps = (obj: TimestampSnapshot) => {
  return Object.keys(obj)
    .sort()
    .reduce((result: TimestampSnapshot, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const updateHexColorsLoading = (map: Map) => {
  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", "#f1f5f9");
};

export const updateHexColorsDelta = (map: Map, delta: Record<string, number>) => {
  // 3 blues (down), neutral, 3 reds (up)
  const cetD13Blue = {
    dark: "#0B3B8C", // deep blue
    mid: "#1F65B7", // medium blue
    light: "#73A8D8", // near the white center
  };

  const cetD13Green = {
    light: "#A6DDA3", // near the white center
    mid: "#4FB173", // medium green
    dark: "#0B7A3C", // deep green
  };

  const zero = "#f1f5f9";
  const v = ["to-number", ["get", ["id"], ["literal", delta]], 0];

  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", [
    "case",
    // not in delta map → neutral
    ["!", ["has", ["id"], ["literal", delta]]],
    zero,

    // negatives
    ["<=", v, -7],
    cetD13Blue.dark,
    ["<=", v, -4],
    cetD13Blue.mid,
    ["<=", v, -1],
    cetD13Blue.light,

    // positives
    [">=", v, 7],
    cetD13Green.dark,
    [">=", v, 4],
    cetD13Green.mid,
    [">=", v, 1],
    cetD13Green.light,

    // |Δ| < 1 → neutral
    zero,
  ]);
};

export const updateHexColorsDensity = (map: Map, density: Record<string, number>) => {
  const logMin = Math.log(1);
  const logMax = Math.log(101);
  const logRange = logMax - logMin;

  const color0 = "transparent";
  const color1 = "#1b5d8a";
  const color2 = "#238a91";
  const color3 = "#2fab84";
  const color4 = "#64c06b";
  const color5 = "#9cd256";
  const color6 = "#d7e24b";
  const color7 = "#fff3a6";

  const expr: ExpressionSpecification = [
    "case",
    // missing id => transparent
    ["!", ["has", ["id"], ["literal", density]]],
    "white",
    // below min => transparent
    ["<", ["get", ["id"], ["literal", density]], 1],
    "white",
    // otherwise interpolate
    [
      "interpolate",
      ["linear"],
      ["ln", ["+", ["get", ["id"], ["literal", density]], 1]],
      logMin,
      color0,
      logMin + logRange * 0.15,
      color1,
      logMin + logRange * 0.3,
      color2,
      logMin + logRange * 0.45,
      color3,
      logMin + logRange * 0.6,
      color4,
      logMin + logRange * 0.75,
      color5,
      logMin + logRange * 0.9,
      color6,
      logMax,
      color7,
    ],
  ];

  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", expr);
};

export const updateHexColorsChurn = (
  map: Map,
  churn: Record<string, number>,
  minChurnForDisplay = 5
) => {
  const zero = "#f9fafb"; // neutral / background

  // Hotter palette
  const c1 = "#D8F0D6"; // very light
  const c2 = "#A6DDA3"; // your light
  const c3 = "#4FB173"; // your mid
  const c4 = "#16693E"; // between mid & dark
  const c5 = "#064024"; // deeper than your dark

  const v: any = ["to-number", ["get", ["id"], ["literal", churn]], 0];

  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", [
    "case",
    // No value at all → neutral
    ["!", ["has", ["id"], ["literal", churn]]],
    zero,

    // Below threshold (including 0–4 if minChurnForDisplay = 5) → neutral
    ["<", v, minChurnForDisplay],
    zero,

    // 5–7
    ["<=", v, 7],
    c1,
    // 8–11
    ["<=", v, 11],
    c2,
    // 12–15
    ["<=", v, 15],
    c3,
    // 16–20
    ["<=", v, 20],
    c4,
    // > 20
    c5,
  ]);
};

//volume × HHI-style spatial concentration
export const computeHourScore = (delta: Record<string, number>) => {
  const values = Object.values(delta);
  if (values.length === 0) return 0;

  let totalPos = 0;
  let totalNeg = 0;

  // First pass: total arrival + total departure
  for (const d of values) {
    if (d > 0) totalPos += d;
    else if (d < 0) totalNeg += -d;
  }

  if (totalPos === 0 && totalNeg === 0) {
    return 0;
  }

  let C_pos = 0;
  let C_neg = 0;

  // Second pass: concentration (how concentrated are departures and arrivals)
  for (const d of values) {
    if (d > 0 && totalPos > 0) {
      const share = d / totalPos;
      C_pos += share * share;
    } else if (d < 0 && totalNeg > 0) {
      const absDelta = -d;
      const share = absDelta / totalNeg;
      C_neg += share * share;
    }
  }

  const movementIntensity = totalPos + totalNeg;
  const movementFocus = (C_pos + C_neg) / 2;

  //high volume -> focused few hexes = highest score
  //medium volume -> focused few hexes = medium score
  //high volume -> no clear focused hexes = low score
  return movementIntensity * movementFocus;
};
