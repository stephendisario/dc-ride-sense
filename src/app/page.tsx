"use client";
import { useEffect, useState } from "react";
import Map, { Layer, Popup, Source, useMap } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useGetSnapshots } from "./api/getSnapshot";
import { formatDate } from "date-fns";
import { FeatureCollection } from "geojson";
import { getSnapshotTimestamp, updateCounts } from "./lib/helper";
import { INITIAL_CENTER, INITIAL_ZOOM } from "./lib/constants";
import { bikeLanesLayerStyle, zones1000mLayerStyle, zones300mLayerStyle } from "./lib/layerStyles";
import { GeoJSONFeature, MapMouseEvent } from "mapbox-gl";
import zones1000m from "../../public/dc-grid-clipped-4362.json";
import zones300m from "../../public/dc-grid-clipped-4326-300m.json";
import bikeLanes from "../../public/opendata/Bicycle_Lanes.json";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const App = () => {
  const [zonesData, setZonesData] = useState<FeatureCollection>(zones300m as FeatureCollection);
  const [zonesId, setZonesId] = useState<ZoneType>("300m");

  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderLabel, setSliderLabel] = useState<string>();

  const [hoverInfo, setHoverInfo] = useState<{
    lngLat: [number, number];
    count: number;
  } | null>(null);

  const { isPending, error, data } = useGetSnapshots(
    "2025-04-15",
    zonesId,
    formatDate(new Date(), "yyyy-MM-dd")
  );

  const { map } = useMap();

  useEffect(() => {
    if (!isPending && !error && zonesData && map) {
      const timestamp = Object.keys(data)[0];
      setSliderLabel(timestamp);

      updateCounts(zonesData, data, timestamp, map, zonesId);
    }
  }, [isPending, error, data]);

  const handleSliderChange = (value: string) => {
    if (!data) return;
    const timestamp = getSnapshotTimestamp(parseInt(value), data);
    if (timestamp && zonesData && map) {
      updateCounts(zonesData, data, timestamp, map, zonesId);
    }
    setSliderValue(parseInt(value));
    setSliderLabel(timestamp);
  };

  const handleClick = (event: MapMouseEvent) => {
    const feature = event.features && event.features[0];
    console.log(feature, event, setHoverInfo);
    if (feature) {
      setHoverInfo({
        lngLat: [event.lngLat.lng, event.lngLat.lat],
        count:
          (map?.getFeatureState({ source: zonesId, id: feature.id } as GeoJSONFeature)
            ?.count as number) ?? 0,
      });
    } else {
      setHoverInfo(null);
    }
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
        <input
          type="range"
          min={0}
          max={1}
          onChange={(e) => {
            console.log(e.target.value);
            setZonesData(
              e.target.value === "0"
                ? (zones1000m as FeatureCollection)
                : (zones300m as FeatureCollection)
            );
            setZonesId(e.target.value === "0" ? "1000m" : "300m");
          }}
        />
        <p>{zonesId}</p>
      </div>
      <Map
        interactiveLayerIds={[zones300mLayerStyle.id, zones1000mLayerStyle.id]}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: INITIAL_CENTER.lng,
          latitude: INITIAL_CENTER.lat,
          zoom: INITIAL_ZOOM,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        id="map"
        onClick={(e) => handleClick(e)}
      >
        <Source id="bike-lanes" type="geojson" data={bikeLanes as FeatureCollection}>
          <Layer {...bikeLanesLayerStyle} />
        </Source>
        {zonesId === "300m" && (
          <Source id="300m" type="geojson" data={zones300m as FeatureCollection}>
            <Layer {...zones300mLayerStyle} />
          </Source>
        )}

        {zonesId === "1000m" && (
          <Source id="1000m" type="geojson" data={zones1000m as FeatureCollection}>
            <Layer {...zones1000mLayerStyle} />
          </Source>
        )}

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.lngLat[0]}
            latitude={hoverInfo.lngLat[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
          >
            <div>{hoverInfo.count}</div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default App;
