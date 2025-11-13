import { useEffect } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { ZoneType } from "@/lib/types";
import { HexLayerType, useView } from "@/stores/views";
import { format } from "date-fns";
import { updateHexColorsDelta, updateHexColorsDensity, updateHexColorsLoading } from "@/lib/helper";

export const useUpdateMapStyleOnChange = () => {
  const { date, hour, setHourTripEstimate, isMapLoading, activeHexLayer, map } = useView();
  const { data: bundle, isLoading: isBundleLoading } = useGetSnapshots(
    format(date, "yyyy-MM-dd"),
    ZoneType.ZoneH3_9
  );

  useEffect(() => {
    if (!map) return;

    if (isBundleLoading || !bundle) {
      updateHexColorsLoading(map);
      return;
    }

    if (activeHexLayer === HexLayerType.DELTA)
      updateHexColorsDelta(bundle, hour, map, setHourTripEstimate);
    else updateHexColorsDensity(bundle, hour, map);
  }, [bundle, hour, map, isBundleLoading, isMapLoading, activeHexLayer]);
};
