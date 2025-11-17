import { useEffect } from "react";
import { DCLayerType, Providers, TimestampSnapshot, ZoneType } from "@shared/types";
import { useGetSnapshots } from "@/api/getSnapshot";
import { useProviderStore } from "@/stores/provider";
import { format } from "date-fns";
import { useView } from "@/stores/views";
import { BIKE_LANES_LAYER_ID, METRO_STATION_LAYER_ID } from "@/lib/constants";

export const useLayerVisibility = () => {
  const { map, activeDCLayers } = useView();

  useEffect(() => {
    if (!map) return;

    map.setLayoutProperty(
      METRO_STATION_LAYER_ID,
      "visibility",
      activeDCLayers.includes(DCLayerType.METRO) ? "visible" : "none"
    );
    map.setLayoutProperty(
      BIKE_LANES_LAYER_ID,
      "visibility",
      activeDCLayers.includes(DCLayerType.BIKE_LANES) ? "visible" : "none"
    );
  }, [map, activeDCLayers]);
};
