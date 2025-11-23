import { useEffect } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { HexLayerType, ZoneType } from "@shared/types";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import {
  updateHexColorsChurn,
  updateHexColorsDelta,
  updateHexColorsDensity,
  updateHexColorsLoading,
} from "@/lib/layerStyles";
import { useProviderStore } from "@/stores/provider";
import { useHexMetrics } from "./useHexMetrics";

export const useUpdateMapStyleOnChange = () => {
  const { date, hour, isMapLoading, activeHexLayer, map } = useView();
  const { selectedProviders } = useProviderStore();

  const { metricObj } = useHexMetrics();

  const { data: bundle, isLoading: isBundleLoading } = useGetSnapshots(
    format(date, "yyyy-MM-dd"),
    ZoneType.ZoneH3_9
  );

  useEffect(() => {
    if (!map) return;

    if (isBundleLoading || !bundle || !metricObj) {
      updateHexColorsLoading(map);
      return;
    }

    if (activeHexLayer === HexLayerType.DELTA) updateHexColorsDelta(map, metricObj);
    else if (activeHexLayer === HexLayerType.DENSITY) updateHexColorsDensity(map, metricObj);
    else if (activeHexLayer === HexLayerType.CHURN) updateHexColorsChurn(map, metricObj);
  }, [
    bundle,
    hour,
    map,
    isBundleLoading,
    isMapLoading,
    activeHexLayer,
    selectedProviders,
    metricObj,
  ]);
};
