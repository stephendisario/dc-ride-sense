import {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
} from "mapbox-gl";
import {
  H3_9_LAYER_ID,
  H3_9_SOURCE_ID,
  METRO_STATION_LAYER_ID,
  METRO_STATION_SOURCE_ID,
} from "./constants";

export const bikeLanesLayerStyle: LineLayerSpecification = {
  id: "bike-lanes-layer",
  type: "line",
  paint: {
    "line-color": "#00ff22",
    "line-width": 2,
  },
  source: "",
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
