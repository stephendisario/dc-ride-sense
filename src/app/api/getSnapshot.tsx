import { useQuery } from "@tanstack/react-query";
import { MICROMOBILITY_ENDPOINT_PROD } from "../lib/constants";
import { sortObjectKeys } from "../lib/helper";

const getSnapshots = async (startDate: string, endDate?: string): Promise<Snapshot> => {
  const res = await fetch(
    `${MICROMOBILITY_ENDPOINT_PROD}/snapshot?startDate=${startDate}${endDate ? "&endDate=" + endDate : ""}`
  );
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  const data = await res.json();
  return sortObjectKeys(data);
};

export const useGetSnapshots = (startDate: string, endDate?: string) => {
  return useQuery({
    queryKey: ["snapshots", startDate, endDate],
    queryFn: () => getSnapshots(startDate, endDate),
    staleTime: Infinity,
  });
};
