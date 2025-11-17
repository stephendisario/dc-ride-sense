import { SQSEvent } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { subDays, format as formatDateFns } from 'date-fns';
import { latLngToCell } from 'h3-js';
import { Providers, ZoneType, ZoneMetrics, Snapshot, TimestampSnapshot, LimeApiResponse } from '@shared/types';
import { PROVIDERS, PROVIDERS_WITH_CHURN } from '@shared/constants';
import { parseDateString } from 'micromobility-app/lib/helper';

const s3 = new S3Client({});
const bucketName = 'micromobility-snapshots';

const DISABLED_DATES = new Set<string>(['2025-07-26', '2025-10-20', '2025-11-13', '2025-11-14']);

const dateToYMD = (dateStr: string) => {
    const { year, month, day } = parseDateString(dateStr);
    return { year, month, day };
};

// const loadGbfs = async (key: string): Promise<LimeApiResponse | null> => {
//   try {
//     const resp = await s3.send(
//       new GetObjectCommand({
//         Bucket: bucketName,
//         Key: key,
//       })
//     );
//     const body = await resp.Body?.transformToString();
//     if (!body) return null;
//     return JSON.parse(body) as LimeApiResponse;
//   } catch (err: any) {
//     if (err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404) {
//       console.log("GBFS not found for key:", key);
//       return null;
//     }
//     console.error("Error loading GBFS", key, err);
//     throw err;
//   }
// };

// const buildMidnightMetricsForProvider = async (
//   dateStr: string, // "YYYY-MM-DD"
//   provider: Providers
// ): Promise<Record<string, ZoneMetrics> | null> => {
//   // Skip TOTAL when computing provider snapshots
//   if (provider === Providers.TOTAL) return null;

//   const date = new Date(`${dateStr}T00:00:00Z`);
//   const prevDate = subDays(date, 1);
//   const prevDateStr = formatDateFns(prevDate, "yyyy-MM-dd");

//   const { year: prevYear, month: prevMonth, day: prevDay } = dateToYMD(prevDateStr);
//   const { year, month, day } = dateToYMD(dateStr);

//   const prevTs = `${prevDateStr}T23:00`;
//   const currTs = `${dateStr}T00:00`;

//   const prevKey = `${prevYear}/${prevMonth}/${prevDay}/${prevTs}-${provider}.geojson`;
//   const currKey = `${year}/${month}/${day}/${currTs}-${provider}.geojson`;

//   const prevGbfs = await loadGbfs(prevKey);
//   const currGbfs = await loadGbfs(currKey);

//   if (!prevGbfs || !currGbfs) {
//     console.log(
//       `Skipping provider ${provider} for ${dateStr} midnight (missing prev or curr GBFS)`
//     );
//     return null;
//   }

//   const prevObj: Record<string, string[]> = {};
//   prevGbfs.data.bikes.forEach((bike) => {
//     const { lat, lon, bike_id } = bike;
//     const zoneId = latLngToCell(lat, lon, 9);
//     if (!zoneId) return;
//     (prevObj[zoneId] ??= []).push(bike_id);
//   });

//   const currObj: Record<string, string[]> = {};
//   currGbfs.data.bikes.forEach((bike) => {
//     const { lat, lon, bike_id } = bike;
//     const zoneId = latLngToCell(lat, lon, 9);
//     if (!zoneId) return;
//     (currObj[zoneId] ??= []).push(bike_id);
//   });

//   const allZoneIds = new Set<string>([
//     ...Object.keys(prevObj),
//     ...Object.keys(currObj),
//   ]);

//   const metricsByZone: Record<string, ZoneMetrics> = {};
//   const hasChurn = PROVIDERS_WITH_CHURN.includes(provider);

//   for (const zoneId of allZoneIds) {
//     const prevBikeIds = prevObj[zoneId] ?? [];
//     const currBikeIds = currObj[zoneId] ?? [];

//     const density = currBikeIds.length;
//     const delta = density - prevBikeIds.length;

//     let churn = 0;
//     if (hasChurn) {
//       const uniqueOld = prevBikeIds.filter((id) => !currBikeIds.includes(id));
//       const uniqueNew = currBikeIds.filter((id) => !prevBikeIds.includes(id));
//       churn = uniqueOld.length + uniqueNew.length;
//     }

//     metricsByZone[zoneId] = { density, delta, churn };
//   }

//   return metricsByZone;
// };

// const fixMidnightForDate = async (dateStr: string, zoneType: ZoneType) => {
//   if (DISABLED_DATES.has(dateStr)) {
//     console.log(`Skipping disabled date ${dateStr}`);
//     return;
//   }

//   if (zoneType !== ZoneType.ZoneH3_9) {
//     console.log(`Skipping zoneType ${zoneType} (only h3-9 supported)`);
//     return;
//   }

//   const { year, month, day } = dateToYMD(dateStr);
//   const multiHourKey = `${year}/${month}/${day}/${zoneType}.json`;
//   const midnightTimestamp = `${dateStr}T00:00`;

//   // Load existing multi-hour snapshot
//   let multiHourSnapshot: TimestampSnapshot = {};
//   try {
//     const resp = await s3.send(
//       new GetObjectCommand({
//         Bucket: bucketName,
//         Key: multiHourKey,
//       })
//     );
//     const body = await resp.Body?.transformToString();
//     multiHourSnapshot = body ? JSON.parse(body) : {};
//   } catch (err: any) {
//     if (err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404) {
//       console.log(`No existing multi-hour snapshot for ${dateStr}, will create a new one.`);
//       multiHourSnapshot = {};
//     } else {
//       console.error("Error loading multi-hour snapshot", err);
//       throw err;
//     }
//   }

//   // 🔥 Strip TOTAL from *all* timestamps if present
//   for (const snapshot of Object.values(multiHourSnapshot)) {
//     if (snapshot[Providers.TOTAL]) {
//       delete snapshot[Providers.TOTAL];
//     }
//   }

//   // Build midnight snapshot per provider (excluding TOTAL)
//   const midnightSnapshot: Snapshot = {};
//   for (const provider of PROVIDERS) {
//     if (provider === Providers.TOTAL) continue;

//     const metricsByZone = await buildMidnightMetricsForProvider(dateStr, provider);
//     if (metricsByZone && Object.keys(metricsByZone).length > 0) {
//       midnightSnapshot[provider] = metricsByZone;
//     }
//   }

//   if (Object.keys(midnightSnapshot).length === 0) {
//     console.log(`No providers with usable GBFS for midnight on ${dateStr}, nothing to write.`);
//     // Still write the cleaned snapshot (without TOTAL) if it existed
//     await s3.send(
//       new PutObjectCommand({
//         Bucket: bucketName,
//         Key: multiHourKey,
//         Body: JSON.stringify(multiHourSnapshot),
//         ContentType: "application/json",
//       })
//     );
//     return;
//   }

//   // Overwrite or create midnight entry
//   multiHourSnapshot[midnightTimestamp] = midnightSnapshot;

//   await s3.send(
//     new PutObjectCommand({
//       Bucket: bucketName,
//       Key: multiHourKey,
//       Body: JSON.stringify(multiHourSnapshot),
//       ContentType: "application/json",
//     })
//   );

//   console.log(
//     `Updated midnight (${midnightTimestamp}) in ${multiHourKey}, removed TOTAL from all timestamps`
//   );
// };

export const lambdaHandler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const message = JSON.parse(record.body) as {
            date: string; // "YYYY-MM-DD"
            zoneType: ZoneType;
        };

        const { date, zoneType } = message;
        console.log(`Fixing midnight + removing TOTAL for ${date}, zoneType=${zoneType}`);
        // await fixMidnightForDate(date.slice(0, 10), zoneType);
    }
};
