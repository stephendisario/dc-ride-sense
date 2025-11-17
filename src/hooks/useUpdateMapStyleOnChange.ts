import { useEffect, useMemo } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { HexLayerType, ZoneType } from "@shared/types";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import {
  getMetricByZone,
  updateHexColorsChurn,
  updateHexColorsDelta,
  updateHexColorsDensity,
  updateHexColorsLoading,
} from "@/lib/helper";
import { useProviderStore } from "@/stores/provider";
import { useHexHover } from "./useHexHover";

export const useUpdateMapStyleOnChange = () => {
  const { date, hour, isMapLoading, activeHexLayer, map, setHourTripEstimate } = useView();
  const { selectedProviders } = useProviderStore();
  const { data: bundle, isLoading: isBundleLoading } = useGetSnapshots(
    format(date, "yyyy-MM-dd"),
    ZoneType.ZoneH3_9
  );

  const metricObj = useMemo(() => {
    if (!bundle) return null;
    const timestamp = Object.keys(bundle)[hour];
    return getMetricByZone(bundle[timestamp], selectedProviders, activeHexLayer);
  }, [bundle, hour, selectedProviders, activeHexLayer]);

  useHexHover(map, metricObj ?? null);

  useEffect(() => {
    if (!map) return;

    if (isBundleLoading || !bundle || !metricObj) {
      updateHexColorsLoading(map);
      return;
    }

    if (activeHexLayer === HexLayerType.DELTA) updateHexColorsDelta(map, metricObj);
    else if (activeHexLayer === HexLayerType.DENSITY) updateHexColorsDensity(map, metricObj);
    else if (activeHexLayer === HexLayerType.CHURN) updateHexColorsChurn(map, metricObj);
  }, [bundle, hour, map, isBundleLoading, isMapLoading, activeHexLayer, selectedProviders]);
};
