import { ExpressionSpecification, Map } from "mapbox-gl";
import { H3_9_LAYER_ID } from "./constants";

export const getHour = (date: string) => {
  return date.slice(11, 13);
};

export const getSnapshotTimestamp = (value: number, snapshot: Snapshot) => {
  const timestamps = Object.keys(snapshot);

  return timestamps[value];
};

export const sortSnapshotTimestamps = (obj: Snapshot) => {
  return Object.keys(obj)
    .sort()
    .reduce((result: Snapshot, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export function deltaForHour(bundle: Record<string, Record<string, number>>, hour: number) {
  const tsNow = getSnapshotTimestamp(hour, bundle);
  const tsPrev = getSnapshotTimestamp(hour - 1, bundle);

  if (!tsNow || !tsPrev) return {};

  const now = bundle[tsNow] ?? {};
  const prev = bundle[tsPrev] ?? {};

  //get all unique ids between the two timestamps
  const ids = new Set([...Object.keys(now), ...Object.keys(prev)]);
  const out: Record<string, number> = {};
  for (const id of ids) out[id] = (now[id] ?? 0) - (prev[id] ?? 0);
  return out;
}

export const updateHexColorsLoading = (map: Map) => {
  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", "#f1f5f9");
};

export const updateHexColorsDelta = (
  bundle: Snapshot,
  hour: number,
  map: Map,
  setHourTripEstimate: (t: number) => void
) => {
  const delta = deltaForHour(bundle, hour);
  const hourTripEstimate = Object.values(delta).reduce(
    (acc, cur) => (cur > 0 ? cur + acc : acc),
    0
  );
  setHourTripEstimate(hourTripEstimate);

  //TODO: handle midnight
  if (Object.keys(delta).length === 0) {
    updateHexColorsLoading(map);
    return;
  }

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
  const neg1 = "#9ecae1",
    neg2 = "#6baed6",
    neg3 = "#3182bd";
  const zero = "#f1f5f9";
  const pos1 = "#fcae91",
    pos2 = "#fb6a4a",
    pos3 = "#cb181d";

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

export const updateHexColorsDensity = (bundle: Snapshot, hour: number, map: Map) => {
  if (!bundle || !map) return;

  const obj = bundle[getSnapshotTimestamp(hour, bundle)];
  // If obj might be a Map or something else, normalize:
  // obj = obj instanceof Map ? Object.fromEntries(obj) : obj;

  const logMin = Math.log(1);
  const logMax = Math.log(101);
  const logRange = logMax - logMin;

  // Strictly strings
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

  // Sanity check: no non-strings at color positions
  // (Optional) console.log(JSON.stringify(expr));

  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", expr);
};

//flow intensity × HHI-style spatial concentration
export const computeHourScore = (delta: Record<string, number>) => {
  const values = Object.values(delta);
  if (values.length === 0) return 0;

  let totalPos = 0;
  let totalNeg = 0;

  // First pass: totals
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
