import { Feature, FeatureCollection } from "geojson";
import { GeoJSONFeature } from "mapbox-gl";
import { MapRef } from "react-map-gl/mapbox";

export const getHour = (date: string) => {
  return date.slice(11, 13);
};

export const updateCounts = (
  zonesData: FeatureCollection,
  data: Snapshot,
  timestamp: string,
  map: MapRef,
  zonesId: string
) => {
  zonesData.features.forEach((feature: Feature) => {
    const id = feature.id!;
    map?.setFeatureState({ source: zonesId, id: feature.id } as GeoJSONFeature, {
      count: data[timestamp][id] ?? 0,
    });
  });
};

export const getSnapshotTimestamp = (value: number, snapshot: Snapshot) => {
  const timestamps = Object.keys(snapshot);

  return timestamps[value];
};

export const sortObjectKeys = (obj: any) => {
  return Object.keys(obj)
    .sort()
    .reduce((result: any, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const promotePropertyId = (featureCollection: FeatureCollection) => {
  let featureArray = featureCollection.features.map((f) => {
    return { ...f, id: f?.properties?.id };
  });

  featureCollection.features = featureArray;

  return featureCollection;
};
