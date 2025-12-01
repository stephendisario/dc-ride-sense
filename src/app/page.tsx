"use client";
import { useEffect, useRef } from "react";
import mapboxgl, { LngLatBoundsLike, Map as MapboxMap } from "mapbox-gl";
import {
  BIKE_LANES_LAYER_ID,
  BIKE_LANES_SOURCE_ID,
  BIKE_LANES_SOURCE_URL,
  H3_9_SOURCE_ID,
  H3_9_SOURCE_URL,
  INITIAL_CENTER,
  INITIAL_CENTER_MOBILE,
  INITIAL_ZOOM,
  INITIAL_ZOOM_MOBILE,
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
import { useHexHover } from "@/hooks/useHexHover";
import { useUpdateMapStyleOnChange } from "@/hooks/useUpdateMapStyleOnChange";
import { useSnapshotsWithProviders } from "@/hooks/useSnapshotsWithProviders";
import TimeControlBox from "../components/TimeControlBox";
import HexLegend from "@/components/HexLegend";
import FilterPills from "@/components/FilterPills";
import IntroModal from "@/components/IntroModal";
import { useIsMdUp } from "@/hooks/useIsMdUp";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const App = () => {
  const mapRef = useRef<MapboxMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const { setMap, showIntro, setShowIntro } = useView();

  const isMdUp = useIsMdUp();

  useUpdateMapStyleOnChange();
  useSnapshotsWithProviders();
  useHexHover();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const DC_BOUNDS: LngLatBoundsLike = [
      [-77.35, 38.6],
      [-76.75, 39.2],
    ];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: isMdUp ? INITIAL_CENTER : INITIAL_CENTER_MOBILE,
      zoom: isMdUp ? INITIAL_ZOOM : INITIAL_ZOOM_MOBILE,
      maxBounds: DC_BOUNDS,
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
  }, [setMap, isMdUp]);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} className="h-[100dvh] w-screen" />

      <div className="pointer-events-none absolute inset-0">
        <div className="flex flex-col justify-between p-3 w-full h-full">
          <IntroModal manualOpen={showIntro} onCloseManual={() => setShowIntro(false)} />
          <div className="absolute left-0 top-0 md:left-3 md:top-3">
            <Header />
          </div>
          <div className="absolute top-3 right-auto md:right-3 left-1.5 top-[26%] -translate-y-[26%] md:left-auto md:top-auto md:translate-y-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2">
            <FilterPills />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-3 bottom-3">
            <TimeControlBox />
          </div>
          <div className="absolute bottom-3 right-auto md:right-3 left-1.5 md:w-[420px] top-[53%] -translate-y-[53%] md:left-auto md:top-auto md:translate-y-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2">
            <HexLegend />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
