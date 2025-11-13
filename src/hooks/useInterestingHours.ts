import { useEffect } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { ZoneType } from "@/lib/types";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import { computeHourScore, deltaForHour } from "@/lib/helper";

export const useInterestingHours = () => {
  const { setInterestingHours, date } = useView();
  const { data: bundle } = useGetSnapshots(format(date, "yyyy-MM-dd"), ZoneType.ZoneH3_9);

  useEffect(() => {
    if (!bundle) return;

    const scores: { hour: number; score: number }[] = [];

    for (let h = 1; h < 24; h++) {
      const delta = deltaForHour(bundle, h);

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
  }, [bundle, setInterestingHours]);
};
