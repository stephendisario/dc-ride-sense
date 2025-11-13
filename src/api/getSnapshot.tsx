import { useQuery } from "@tanstack/react-query";
import { MICROMOBILITY_ENDPOINT_PROD } from "../lib/constants";
import { sortSnapshotTimestamps } from "../lib/helper";
import { ZoneType } from "../lib/types";

const getSnapshots = async (dateString: string, zoneType: ZoneType): Promise<Snapshot> => {
  const res = await fetch(
    `${MICROMOBILITY_ENDPOINT_PROD}/snapshot?dateString=${dateString}&zoneType=${zoneType}`
  );
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  const data: Snapshot = await res.json();
  return sortSnapshotTimestamps(data);
};

export const useGetSnapshots = (dateString: string, zoneType: ZoneType) => {
  return useQuery({
    queryKey: ["snapshots", dateString, zoneType],
    queryFn: () => getSnapshots(dateString, zoneType),
    staleTime: Infinity,
  });
};
