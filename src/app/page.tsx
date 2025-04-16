"use client";
import { useEffect, useState } from "react";
import Map, { Layer, Source, useMap } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useGetSnapshots } from "./api/getSnapshot";
import { formatDate } from "date-fns";
import { FeatureCollection } from "geojson";
import { getSnapshotTimestamp, updateCounts } from "./lib/helper";
import { INITIAL_CENTER, INITIAL_ZOOM } from "./lib/constants";
import { bikeLanesLayerStyle, zonesLayerStyle } from "./lib/layerStyles";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const App = () => {
  const { isPending, error, data } = useGetSnapshots(
    "2025-04-15",
    formatDate(new Date(), "yyyy-MM-dd")
  );
  const [bikeLanesData, setBikeLanesData] = useState<FeatureCollection>();
  const [zonesData, setZonesData] = useState<FeatureCollection>();

  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderLabel, setSliderLabel] = useState<string>();

  const { map } = useMap();

  useEffect(() => {
    const fetchBikeLanes = async () => {
      const resp = await fetch("/opendata/Bicycle_Lanes.geojson").then((resp) => resp.json());
      setBikeLanesData(resp);
    };

    const fetchZones = async () => {
      const resp = await fetch("/dc-grid-clipped-4362.geojson").then((resp) => resp.json());
      setZonesData(resp);
    };

    fetchBikeLanes();
    fetchZones();
  }, []);

  useEffect(() => {
    if (!isPending && !error && zonesData && map) {
      const timestamp = Object.keys(data)[0];
      setSliderLabel(timestamp);

      updateCounts(zonesData, data, timestamp, map);
    }
  }, [isPending, error, data]);

  const handleSliderChange = (value: string) => {
    if (!data) return;
    const timestamp = getSnapshotTimestamp(parseInt(value), data);
    if (timestamp && zonesData && map) {
      updateCounts(zonesData, data, timestamp, map);
    }
    setSliderValue(parseInt(value));
    setSliderLabel(timestamp);
  };

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-0 left-0 z-10">
        <input
          type="range"
          min={0}
          max={Object.keys(data ?? {}).length - 1}
          onChange={(e) => handleSliderChange(e.target.value)}
          value={sliderValue}
        />
        <p>{sliderLabel}</p>
      </div>
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: INITIAL_CENTER.lng,
          latitude: INITIAL_CENTER.lat,
          zoom: INITIAL_ZOOM,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        id="map"
      >
        <Source id="bike-lanes" type="geojson" data={bikeLanesData}>
          <Layer {...bikeLanesLayerStyle} />
        </Source>
        <Source id="zones" type="geojson" data={zonesData}>
          <Layer {...zonesLayerStyle} />
        </Source>
      </Map>
    </div>
  );
};

export default App;
