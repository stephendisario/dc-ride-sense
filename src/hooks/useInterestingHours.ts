import { useEffect } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { HexLayerType, ZoneType } from "@shared/types";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import { computeHourScore, getMetricByZone } from "@/lib/helper";
import { useProviderStore } from "@/stores/provider";

export const useInterestingHours = () => {
  const { setInterestingHours, date, activeHexLayer } = useView();
  const { selectedProviders } = useProviderStore();
  const { data: bundle } = useGetSnapshots(format(date, "yyyy-MM-dd"), ZoneType.ZoneH3_9);

  useEffect(() => {
    if (!bundle) return;

    const scores: { hour: number; score: number }[] = [];
    const timestamps = Object.keys(bundle);

    for (let h = 1; h < 24; h++) {
      const timestamp = timestamps[h];
      const delta = getMetricByZone(bundle[timestamp], selectedProviders, HexLayerType.DELTA);

      if (!delta || Object.keys(delta).length === 0) {
        scores.push({ hour: h, score: 0 });
        continue;
      }

      const score = computeHourScore(delta);
      scores.push({ hour: h, score });
    }

    const top3 = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.hour);

    setInterestingHours(top3);
  }, [bundle, setInterestingHours, selectedProviders, activeHexLayer]);
};
