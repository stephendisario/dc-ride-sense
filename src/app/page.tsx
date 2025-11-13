"use client";
import { useEffect, useRef } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  H3_9_SOURCE_ID,
  H3_9_SOURCE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  METRO_STATION_SOURCE_ID,
  METRO_STATION_SOURCE_URL
} from "../lib/constants";
import { H3_9_LAYER_STYLE, METRO_STATION_LAYER_STYLE } from "../lib/layerStyles";
import Header from "../components/Header";
import DatePicker from "../components/DatePicker";
import { useUpdateMapStyleOnChange } from "@/map/map-config";
import { useView } from "@/stores/views";
import Controls from "@/components/Controls";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const App = () => {
  const mapRef = useRef<MapboxMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const { setIsMapLoading } = useView();

  useUpdateMapStyleOnChange(mapRef.current);

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

      map.addLayer(H3_9_LAYER_STYLE);
      map.addLayer(METRO_STATION_LAYER_STYLE);

      setIsMapLoading(false);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [setIsMapLoading]);

  return (
    <>
      <div className="h-screen w-screen" id="map-container" ref={mapContainerRef} />
      <Header />
      <DatePicker />
      <Controls />
    </>
  );
};

export default App;
