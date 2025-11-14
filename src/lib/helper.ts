import { ExpressionSpecification, Map } from "mapbox-gl";
import { H3_9_LAYER_ID } from "./constants";
import { Providers, Snapshot, TimestampSnapshot, ZoneMetrics } from "@shared/types";

export const getMetricByZone = (
  snapshot: Snapshot,
  provider: Providers,
  metric: keyof ZoneMetrics
): Record<string, number> => {
  const providerZones = snapshot?.[provider] ?? {};
  const result: Record<string, number> = {};

  for (const [zoneId, metrics] of Object.entries(providerZones)) {
    result[zoneId] = metrics[metric];
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

export const updateHexColorsDelta = (
  bundle: TimestampSnapshot,
  hour: number,
  map: Map,
  setHourTripEstimate: (t: number) => void,
  timestamp: string
) => {
  const delta = getMetricByZone(bundle[timestamp], Providers.TOTAL, "delta");

  const hourTripEstimate = Object.values(delta).reduce(
    (acc, cur) => (cur > 0 ? cur + acc : acc),
    0
  );
  setHourTripEstimate(hourTripEstimate);

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

export const updateHexColorsDensity = (bundle: TimestampSnapshot, map: Map, timestamp: string) => {
  const obj = getMetricByZone(bundle[timestamp], Providers.TOTAL, "density");

  const logMin = Math.log(1);
  const logMax = Math.log(101);
  const logRange = logMax - logMin;

  const color0 = "#0b276d";
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
    ["!", ["has", ["id"], ["literal", obj]]],
    "#0b276d",
    // below min => transparent
    ["<", ["get", ["id"], ["literal", obj]], 1],
    "#0b276d",
    // otherwise interpolate
    [
      "interpolate",
      ["linear"],
      ["ln", ["+", ["get", ["id"], ["literal", obj]], 1]],
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
