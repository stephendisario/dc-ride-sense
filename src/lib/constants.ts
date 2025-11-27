import { LngLat } from "mapbox-gl";

export const MICROMOBILITY_ENDPOINT = process.env.NEXT_PUBLIC_MICROMOBILITY_ENDPOINT;
const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE;

export const INITIAL_CENTER = new LngLat(-77.032, 38.9);
export const INITIAL_ZOOM = 11.0;

export const H3_9_SOURCE_URL = `${CDN_BASE}/zones-h3-9.geojson`;
export const H3_9_SOURCE_ID = "h3-9-source";
export const H3_9_LAYER_ID = "h3-9-layer";

export const METRO_STATION_SOURCE_URL = `${CDN_BASE}/Metro_Stations_Regional.geojson`;
export const METRO_STATION_SOURCE_ID = "metro-station-source";
export const METRO_STATION_LAYER_ID = "metro-station-layer";

export const BIKE_LANES_SOURCE_URL = `${CDN_BASE}/Bicycle_Lanes.geojson`;
export const BIKE_LANES_SOURCE_ID = "bike-lanes-source";
export const BIKE_LANES_LAYER_ID = "bike-lanes-layer";

export const gridSourceId = "grid-source";
export const gridLayerId = "grid-layer";

export const roadBlockSourceId = "road-block-source";
export const roadBlockLayerId = "road-block-layer";
export const roadBlockHiddenLayerId = "road-block-hidden-layer";

export const allLayerIds = ["dc-h3"];

export const gradientArray = {
  [`${gridSourceId}`]: [
    { count: 1, color: "#e5f5e0" },
    { count: 10, color: "#c7e9c0" },
    { count: 20, color: "#a1d99b" },
    { count: 50, color: "#74c476" },
    { count: 100, color: "#238b45" },
    { count: 150, color: "#005a32" },
  ],

  [`${roadBlockSourceId}`]: [
    { count: 1, color: "#c7e9c0" },
    { count: 3, color: "#7fcdbb" },
    { count: 6, color: "#41ab5d" },
    { count: 11, color: "#238b45" },
    { count: 21, color: "#006d2c" },
    { count: 51, color: "#00441b" },
    { count: 101, color: "#002d13" },
  ],
};
