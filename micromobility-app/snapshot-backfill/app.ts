import { SQSEvent } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { parseDateString } from '../helper';
import { Providers, Snapshot, TimestampSnapshot, ZoneMetrics, ZoneType, LimeApiResponse } from '@shared/types';
import { latLngToCell } from 'h3-js';

const s3 = new S3Client({});
const bucketName = 'micromobility-snapshots';

const extractTimestampFromGbfsKey = (key: string): string => {
    // key: "2025/05/10/2025-05-10T22:00-LIME.geojson"
    const filename = key.split('/').pop()!; // "2025-05-10T22:00-LIME.geojson"
    return filename.replace('-LIME.geojson', ''); // "2025-05-10T22:00"
};

const buildMultiHourSnapshotFromGbfs = async (gbfsKeys: string[]): Promise<TimestampSnapshot> => {
    const multiHourSnapshot: TimestampSnapshot = {};

    // Sort keys by timestamp so we can do hour-over-hour deltas
    const sortedKeys = [...gbfsKeys].sort((a, b) =>
        extractTimestampFromGbfsKey(a).localeCompare(extractTimestampFromGbfsKey(b)),
    );

    let prevZonesLime: Record<string, number> = {};

    for (const key of sortedKeys) {
        const timestamp = extractTimestampFromGbfsKey(key);

        const resp = await s3.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            }),
        );
        const body = await resp.Body?.transformToString();
        if (!body) continue;

        const gbfs = JSON.parse(body) as LimeApiResponse;

        // 1) Compute current densities by H3-9 hex
        const currZonesLime: Record<string, number> = {};

        gbfs.data.bikes.forEach((bike) => {
            const { lat, lon } = bike;
            const zoneId = latLngToCell(lat, lon, 9);
            if (!zoneId) return;
            currZonesLime[zoneId] = (currZonesLime[zoneId] || 0) + 1;
        });

        // 2) Compute union-of-zones across current and previous hour
        const allZoneIds = new Set<string>([...Object.keys(currZonesLime), ...Object.keys(prevZonesLime)]);

        const limeMetrics: Record<string, ZoneMetrics> = {};
        const totalMetrics: Record<string, ZoneMetrics> = {};

        for (const zoneId of allZoneIds) {
            const currDensity = currZonesLime[zoneId] ?? 0;
            const prevDensity = prevZonesLime[zoneId] ?? 0;

            const metrics: ZoneMetrics = {
                density: currDensity,
                delta: currDensity - prevDensity,
                churn: 0, // LIME has no churn tracking in your model
            };

            limeMetrics[zoneId] = metrics;
            totalMetrics[zoneId] = { ...metrics };
        }

        const snapshot: Snapshot = {
            [Providers.LIME]: limeMetrics,
            [Providers.TOTAL]: totalMetrics,
        };

        multiHourSnapshot[timestamp] = snapshot;

        // 3) Update previous densities for next hour
        prevZonesLime = currZonesLime;
    }

    return multiHourSnapshot;
};

const processSnapshotChunk = async (date: string, zoneType: ZoneType) => {
    try {
        const { year, month, day } = parseDateString(date);
        const prefix = `${year}/${month}/${day}/`;

        // List all objects for this day
        const listResp = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
            }),
        );

        const contents = listResp.Contents ?? [];
        const keys = contents.map((o) => o.Key!).filter(Boolean);

        // LIME GBFS feeds: "YYYY-MM-DDTHH:MM-LIME.geojson"
        const gbfsKeysLime = keys.filter((key) => {
            if (!key.endsWith('.geojson')) return false;
            const filename = key.split('/').pop()!;
            return filename.endsWith('-LIME.geojson');
        });

        if (gbfsKeysLime.length === 0) {
            console.log(`No LIME GBFS feeds found for ${date}, prefix=${prefix}`);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `No LIME GBFS feeds for ${date}`,
                }),
            };
        }

        // 1) Build new multi-hour snapshot from LIME GBFS only
        const multiHourSnapshot = await buildMultiHourSnapshotFromGbfs(gbfsKeysLime);

        // 2) Write combined file: e.g. "2025/05/10/h3-9.json"
        const multiHourKey = `${prefix}${zoneType}.json`;
        await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: multiHourKey,
                Body: JSON.stringify(multiHourSnapshot),
                ContentType: 'application/json',
            }),
        );

        console.log(
            `Rebuilt densities for ${date}: ` + `${gbfsKeysLime.length} LIME GBFS snapshots -> ${multiHourKey}`,
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Rebuilt ${date}: ${gbfsKeysLime.length} LIME GBFS -> ${multiHourKey}`,
            }),
        };
    } catch (err) {
        console.log('Backfill error', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened during backfill',
            }),
        };
    }
};

export const lambdaHandler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const message = JSON.parse(record.body) as {
            date: string;
            zoneType: ZoneType;
        };

        const { date, zoneType } = message;

        console.log(`Processing LIME-density backfill chunk: ${date} for zone type ${zoneType}`);
        await processSnapshotChunk(date, zoneType);
    }
};
