import { useEffect } from "react";
import { Providers, TimestampSnapshot, ZoneType } from "@shared/types";
import { useGetSnapshots } from "@/api/getSnapshot";
import { useProviderStore } from "@/stores/provider";
import { format } from "date-fns";
import { useView } from "@/stores/views";

const extractProvidersFromSnapshot = (snapshot: TimestampSnapshot): Providers[] => {
  const timestamps = Object.keys(snapshot);
  if (timestamps.length === 0) return [];

  const first = snapshot[timestamps[0]];
  return Object.keys(first).filter((p) => p !== "TOTAL") as Providers[];
};

// find and set available providers for given day
export const useSnapshotsWithProviders = () => {
  const { date } = useView();
  const { data: bundle } = useGetSnapshots(format(date, "yyyy-MM-dd"), ZoneType.ZoneH3_9);
  const { setSelectedProviders, setAvailableProviders } = useProviderStore();

  useEffect(() => {
    if (!bundle) return;

    const providers = extractProvidersFromSnapshot(bundle);
    setSelectedProviders(providers);
    setAvailableProviders(providers);
  }, [bundle, setSelectedProviders, setAvailableProviders]);
};
