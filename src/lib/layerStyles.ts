import {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
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
    "fill-outline-color": "black",
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
