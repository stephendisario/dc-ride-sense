export const getHour = (date: string) => {
  return date.slice(11, 13);
};

export const getSnapshotTimestamp = (value: number, snapshot: Snapshot) => {
  const timestamps = Object.keys(snapshot);

  return timestamps[value];
};

export const sortSnapshotTimestamps = (obj: Snapshot) => {
  return Object.keys(obj)
    .sort()
    .reduce((result: Snapshot, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export function deltaForHour(bundle: Record<string, Record<string, number>>, hour: number) {
  const tsNow = getSnapshotTimestamp(hour, bundle);
  const tsPrev = getSnapshotTimestamp(hour - 1, bundle);

  console.log(tsNow, tsPrev);

  if (!tsNow || !tsPrev) return {};

  const now = bundle[tsNow] ?? {};
  const prev = bundle[tsPrev] ?? {};

  //get all unique ids between the two timestamps
  const ids = new Set([...Object.keys(now), ...Object.keys(prev)]);
  const out: Record<string, number> = {};
  for (const id of ids) out[id] = (now[id] ?? 0) - (prev[id] ?? 0); //change
  return out;
}
