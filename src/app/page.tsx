"use client";
import { useEffect, useRef } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  BIKE_LANES_LAYER_ID,
  BIKE_LANES_SOURCE_ID,
  BIKE_LANES_SOURCE_URL,
  H3_9_SOURCE_ID,
  H3_9_SOURCE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  METRO_STATION_LAYER_ID,
  METRO_STATION_SOURCE_ID,
  METRO_STATION_SOURCE_URL,
} from "../lib/constants";
import {
  BIKE_LANES_LAYER_STYLE,
  H3_9_LAYER_STYLE,
  METRO_STATION_LAYER_STYLE,
} from "../lib/layerStyles";
import Header from "../components/Header";
import { useView } from "@/stores/views";
import ControlBox from "../components/ControlBox";
import ProviderPills from "@/components/ProviderPills";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const App = () => {
  const mapRef = useRef<MapboxMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const { setMap } = useView();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.on("load", () => {
      map.addSource(H3_9_SOURCE_ID, {
        type: "geojson",
        data: H3_9_SOURCE_URL,
        promoteId: "h3",
      });

      map.addSource(METRO_STATION_SOURCE_ID, {
        type: "geojson",
        data: METRO_STATION_SOURCE_URL,
      });

      map.addSource(BIKE_LANES_SOURCE_ID, {
        type: "geojson",
        data: BIKE_LANES_SOURCE_URL,
      });

      map.addLayer(H3_9_LAYER_STYLE);
      map.addLayer(METRO_STATION_LAYER_STYLE);
      map.addLayer(BIKE_LANES_LAYER_STYLE);

      map.setLayoutProperty(METRO_STATION_LAYER_ID, "visibility", "none");
      map.setLayoutProperty(BIKE_LANES_LAYER_ID, "visibility", "none");

      mapRef.current = map;
      setMap(mapRef.current);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <>
      <div className="h-screen w-screen" id="map-container" ref={mapContainerRef} />
      <Header />
      <ProviderPills />
      <ControlBox />
    </>
  );
};

export default App;
