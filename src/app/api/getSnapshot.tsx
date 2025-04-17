import { useQuery } from "@tanstack/react-query";
import { MICROMOBILITY_ENDPOINT_PROD } from "../lib/constants";
import { sortObjectKeys } from "../lib/helper";

const getSnapshots = async (
  startDate: string,
  zoneType: ZoneType,
  endDate?: string
): Promise<Snapshot> => {
  const res = await fetch(
    `${MICROMOBILITY_ENDPOINT_PROD}/snapshot?startDate=${startDate}&zoneType=${zoneType}${endDate ? "&endDate=" + endDate : ""}`
  );
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  const data = await res.json();
  return sortObjectKeys(data);
};

export const useGetSnapshots = (startDate: string, zoneType: ZoneType, endDate?: string) => {
  return useQuery({
    queryKey: ["snapshots", startDate, zoneType, endDate],
    queryFn: () => getSnapshots(startDate, zoneType, endDate),
    staleTime: Infinity,
  });
};
