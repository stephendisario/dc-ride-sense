import {
  CircleLayerSpecification,
  ExpressionSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
} from "mapbox-gl";
import {
  BIKE_LANES_LAYER_ID,
  BIKE_LANES_SOURCE_ID,
  H3_9_LAYER_ID,
  H3_9_SOURCE_ID,
  METRO_STATION_LAYER_ID,
  METRO_STATION_SOURCE_ID,
} from "./constants";

export const BIKE_LANES_LAYER_STYLE: LineLayerSpecification = {
  id: BIKE_LANES_LAYER_ID,
  type: "line",
  source: BIKE_LANES_SOURCE_ID,
  paint: {
    "line-color": "#0f766e", // deep teal
    "line-opacity": 0.7,
    // thinner at low zoom, thicker as you zoom in
    "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.7, 12, 1.2, 14, 2, 16, 3],
    "line-blur": 0.1,
  },
};

export const H3_9_LAYER_STYLE: FillLayerSpecification = {
  id: H3_9_LAYER_ID,
  type: "fill",
  source: H3_9_SOURCE_ID,
  paint: {
    "fill-outline-color": "#d1d5db",
    "fill-color": "transparent",
    "fill-opacity": 0.6,
  },
};

export const METRO_STATION_LAYER_STYLE: CircleLayerSpecification = {
  id: METRO_STATION_LAYER_ID,
  type: "circle",
  source: METRO_STATION_SOURCE_ID,
  paint: {
    "circle-color": "#002d13",
    "circle-radius": 3,
    "circle-opacity": 0.85,
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 1,
  },
};

export const updateHexColorsLoading = (map: Map) => {
  map.setPaintProperty(H3_9_LAYER_ID, "fill-opacity", 0.3);
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
  const logMax = Math.log(100);
  const logRange = logMax - logMin;

  const noData = "#f1f5f9"; // background / no vehicles

  // Indices in L16: [0, 32, 64, 96, 128, 160, 192, 224]
  const color0 = "#1D1B20"; // very dark, near-black
  const color1 = "#1F1B98"; // deep indigo
  const color2 = "#0741B8"; // strong blue
  const color3 = "#146D9D"; // teal-ish blue
  const color4 = "#329453"; // green
  const color5 = "#65B21A"; // yellow-green
  const color6 = "#B1C805"; // green-yellow
  const color7 = "#EEDF2F"; // bright yellow, but not near-white

  const expr: ExpressionSpecification = [
    "case",
    // missing id => background
    ["!", ["has", ["id"], ["literal", density]]],
    noData,

    // below min => background
    ["<", ["get", ["id"], ["literal", density]], 1],
    noData,

    // log-scaled interpolate dark -> light
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

export const updateHexColorsChurn = (map: Map, churn: Record<string, number>) => {
  const noData = "#f1f5f9"; // no churn value at all (keeps background)
  const cetD13Green = {
    light: "#A6DDA3", // near the white center
    mid: "#4FB173", // medium green
    dark: "#0B7A3C", // deep green
  };

  // eslint-disable-next-line
  const v: any = ["to-number", ["get", ["id"], ["literal", churn]], 0];

  map.setPaintProperty(H3_9_LAYER_ID, "fill-color", [
    "case",
    // No value → noData
    ["!", ["has", ["id"], ["literal", churn]]],
    noData,
    // 0–4 → lowChurn (bluish, distinct from greens)
    ["<=", v, 4],
    noData,

    // 5–9 → light green
    ["<=", v, 9],
    cetD13Green.light,

    // 10–19 → strong green (your main “hot” band)
    ["<=", v, 19],
    cetD13Green.mid,

    // 20+ → darkest green
    cetD13Green.dark,
  ]);
};
