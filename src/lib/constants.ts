import { LngLat } from "mapbox-gl";

export const MICROMOBILITY_ENDPOINT_PROD =
  "https://ubrto93gx5.execute-api.us-east-1.amazonaws.com/Prod";

export const INITIAL_CENTER = new LngLat(-77.0369, 38.9072);
export const INITIAL_ZOOM = 11.2;

export const H3_9_SOURCE_URL =
  "https://micromobility-snapshots.s3.us-east-1.amazonaws.com/zones-h3-9.geojson";
export const H3_9_SOURCE_ID = "h3-9-source";
export const H3_9_LAYER_ID = "h3-9-layer";

export const METRO_STATION_SOURCE_URL =
  "https://micromobility-snapshots.s3.us-east-1.amazonaws.com/Metro_Stations_Regional.geojson";
export const METRO_STATION_SOURCE_ID = "metro-station-source";
export const METRO_STATION_LAYER_ID = "metro-station-layer";

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
