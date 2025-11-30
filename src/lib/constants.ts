import { LngLat } from "mapbox-gl";

export const MICROMOBILITY_ENDPOINT = process.env.NEXT_PUBLIC_MICROMOBILITY_ENDPOINT;
const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE;

export const INITIAL_CENTER = new LngLat(-77.032, 38.9);
export const INITIAL_ZOOM = 11.0;

export const DELTA_RANGE_MIN = "Fewer vehicles";
export const DELTA_RANGE_MAX = "More vehicles";

export const DENSITY_RANGE_MIN = "1";
export const DENSITY_RANGE_MAX = "100+";

export const CHURN_RANGE_MIN = "1";
export const CHURN_RANGE_MAX = "20+";

export const H3_9_SOURCE_URL = `${CDN_BASE}/zones-h3-9.geojson`;
export const H3_9_SOURCE_ID = "h3-9-source";
export const H3_9_LAYER_ID = "h3-9-layer";

export const METRO_STATION_SOURCE_URL = `${CDN_BASE}/Metro_Stations_Regional.geojson`;
export const METRO_STATION_SOURCE_ID = "metro-station-source";
export const METRO_STATION_LAYER_ID = "metro-station-layer";

export const BIKE_LANES_SOURCE_URL = `${CDN_BASE}/Bicycle_Lanes.geojson`;
export const BIKE_LANES_SOURCE_ID = "bike-lanes-source";
export const BIKE_LANES_LAYER_ID = "bike-lanes-layer";
