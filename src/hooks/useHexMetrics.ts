import { useMemo } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { ZoneType } from "@shared/types";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import { useProviderStore } from "@/stores/provider";
import { getMetricByZone } from "@/lib/helper";

export const useHexMetrics = () => {
  const { date, hour, activeHexLayer } = useView();
  const { selectedProviders } = useProviderStore();

  const { data: bundle } = useGetSnapshots(format(date, "yyyy-MM-dd"), ZoneType.ZoneH3_9);

  //hex counts for given layer at given hour
  const metricObj = useMemo(() => {
    if (!bundle) return null;
    const timestamps = Object.keys(bundle).sort();
    const timestamp = timestamps[hour];
    if (!timestamp) return null;
    return getMetricByZone(bundle[timestamp], selectedProviders, activeHexLayer);
  }, [bundle, hour, selectedProviders, activeHexLayer]);

  return { metricObj };
};
