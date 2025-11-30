import { useEffect } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { HexLayerType, ZoneType } from "@shared/types";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import {
  updateHexColorsChurn,
  updateHexColorsDelta,
  updateHexColorsDensity,
} from "@/lib/layerStyles";
import { useProviderStore } from "@/stores/provider";
import { useHexMetrics } from "./useHexMetrics";
import { H3_9_LAYER_ID } from "@/lib/constants";

export const useUpdateMapStyleOnChange = () => {
  const { date, hour, isMapLoading, activeHexLayer, map } = useView();
  const { selectedProviders } = useProviderStore();

  const { metricObj } = useHexMetrics();

  const { data: bundle, isFetching } = useGetSnapshots(
    format(date, "yyyy-MM-dd"),
    ZoneType.ZoneH3_9
  );

  useEffect(() => {
    if (!map) return;

    if (isFetching || !bundle || !metricObj) {
      map.setPaintProperty(H3_9_LAYER_ID, "fill-opacity", 0.3);
      return;
    }

    map.setPaintProperty(H3_9_LAYER_ID, "fill-opacity", 0.6);
    if (activeHexLayer === HexLayerType.DELTA) updateHexColorsDelta(map, metricObj);
    else if (activeHexLayer === HexLayerType.DENSITY) updateHexColorsDensity(map, metricObj);
    else if (activeHexLayer === HexLayerType.CHURN) updateHexColorsChurn(map, metricObj);
  }, [bundle, hour, map, isMapLoading, activeHexLayer, selectedProviders, metricObj, isFetching]);
};
