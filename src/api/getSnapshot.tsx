import { useQuery } from "@tanstack/react-query";
import { MICROMOBILITY_ENDPOINT_PROD } from "../lib/constants";
import { sortSnapshotTimestamps } from "../lib/helper";
import { TimestampSnapshot, ZoneType } from "@shared/types";

const logTimestampGaps = (snapshot: TimestampSnapshot) => {
  const timestamps = Object.keys(snapshot).sort();

  const nonHourTimestamps: string[] = [];
  const hoursPresent = new Set<number>();

  for (const ts of timestamps) {
    const [datePart, timePart] = ts.split("T");
    if (!timePart) continue;

    const [hourStr, minuteStr] = timePart.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (!Number.isNaN(hour)) {
      hoursPresent.add(hour);
    }

    if (minute !== 0) {
      nonHourTimestamps.push(ts);
    }
  }

  if (nonHourTimestamps.length > 0) {
    console.log("Non-hour timestamps:", nonHourTimestamps);
  }

  const missingHours: number[] = [];
  for (let h = 0; h < 24; h++) {
    if (!hoursPresent.has(h)) {
      missingHours.push(h);
    }
  }

  if (missingHours.length > 0) {
    console.log("Missing full hours (0-23):", missingHours);
  }
};

const getSnapshots = async (dateString: string, zoneType: ZoneType): Promise<TimestampSnapshot> => {
  const res = await fetch(
    `${MICROMOBILITY_ENDPOINT_PROD}/snapshot?dateString=${dateString}&zoneType=${zoneType}`
  );
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  const data: TimestampSnapshot = await res.json();
  const sorted = sortSnapshotTimestamps(data);

  //log any days with issues
  logTimestampGaps(sorted);

  return sorted;
};

export const useGetSnapshots = (dateString: string, zoneType: ZoneType) => {
  return useQuery({
    queryKey: ["snapshots", dateString, zoneType],
    queryFn: () => getSnapshots(dateString, zoneType),
    staleTime: Infinity,
  });
};
