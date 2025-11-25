import { Providers, Snapshot, TimestampSnapshot, ZoneMetrics } from "@shared/types";

export const getMetricByZone = (
  snapshot: Snapshot,
  providers: Providers[],
  metric: keyof ZoneMetrics
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const provider of providers) {
    // eslint-disable-next-line 
    if (provider === ("TOTAL" as any)) continue; //skip old type if it still exists
    const providerZones = snapshot?.[provider] ?? {};

    for (const [zoneId, metrics] of Object.entries(providerZones)) {
      result[zoneId] = (result[zoneId] ?? 0) + metrics[metric];
    }
  }

  return result;
};

export const getHour = (date: string) => {
  return date.slice(11, 13);
};

export const getSnapshotTimestamp = (value: number, snapshot: TimestampSnapshot) => {
  const timestamps = Object.keys(snapshot);

  return timestamps[value];
};

export const sortSnapshotTimestamps = (obj: TimestampSnapshot) => {
  return Object.keys(obj)
    .sort()
    .reduce((result: TimestampSnapshot, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

//volume × HHI-style spatial concentration
export const computeHourScore = (delta: Record<string, number>) => {
  const values = Object.values(delta);
  if (values.length === 0) return 0;

  let totalPos = 0;
  let totalNeg = 0;

  // First pass: total arrival + total departure
  for (const d of values) {
    if (d > 0) totalPos += d;
    else if (d < 0) totalNeg += -d;
  }

  if (totalPos === 0 && totalNeg === 0) {
    return 0;
  }

  let C_pos = 0;
  let C_neg = 0;

  // Second pass: concentration (how concentrated are departures and arrivals)
  for (const d of values) {
    if (d > 0 && totalPos > 0) {
      const share = d / totalPos;
      C_pos += share * share;
    } else if (d < 0 && totalNeg > 0) {
      const absDelta = -d;
      const share = absDelta / totalNeg;
      C_neg += share * share;
    }
  }

  const movementIntensity = totalPos + totalNeg;
  const movementFocus = (C_pos + C_neg) / 2;

  //high volume -> focused few hexes = highest score
  //medium volume -> focused few hexes = medium score
  //high volume -> no clear focused hexes = low score
  return movementIntensity * movementFocus;
};
