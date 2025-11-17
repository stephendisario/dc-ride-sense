import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import axios, { AxiosResponse } from 'axios';
import { formatEastern, parseDateString, setMinutesToZero } from '../lib/helper';
import { ApiResponseWrapper, LimeApiResponse, Snapshot, TimestampSnapshot, ZoneMetrics, ZoneType } from '@shared/types';
import { latLngToCell } from 'h3-js';
import { subHours } from 'date-fns';
import { GBFS_URLS, PROVIDERS, PROVIDERS_WITH_CHURN } from '@shared/constants';

const s3 = new S3Client({});
const bucketName = 'micromobility-snapshots';
const zoneType = ZoneType.ZoneH3_9;

// Calculate ZoneMetrics for given providers every hour
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const now = new Date();

    const timestamp = formatEastern(now); // e.g. "2025-11-15T13:00"
    const lastHourTimestamp = setMinutesToZero(formatEastern(subHours(now, 1)));
    const easternHour = Number(timestamp.slice(11, 13)); // "HH" → number
    const isFirstHourOfDay = easternHour === 0;

    console.log(timestamp, lastHourTimestamp, easternHour);

    const { year, month, day } = parseDateString(timestamp);

    // fetch gbfs feeds for this hour
    const responses: AxiosResponse[] = await Promise.all(GBFS_URLS.map((url) => axios.get(url)));
    const feeds: ApiResponseWrapper[] = responses.map((r, i) => ({
        feed: r.data,
        provider: PROVIDERS[i],
    }));

    // fetch multi-hour snapshot (we'll append current hour)
    const multiHourKey = `${year}/${month}/${day}/${zoneType}.json`;
    let multiHourSnapshot: TimestampSnapshot = {};
    try {
        const getObject = await s3.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: multiHourKey,
            }),
        );
        const multiHourBody = await getObject.Body?.transformToString();
        multiHourSnapshot = multiHourBody ? JSON.parse(multiHourBody) : {};
    } catch (err: any) {
        if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
            multiHourSnapshot = {};
        } else {
            console.error('Error fetching multi-hour snapshot', err);
            throw err;
        }
    }

    let currentSnapshot: Snapshot = {};

    for (const { feed, provider } of feeds) {
        try {
            const lastObj: { [zoneId: string]: string[] } = {};

            // For first hour of the day skip previous hour
            // so lastObj stays empty and force delta/churn = 0 below.
            if (!isFirstHourOfDay) {
                // get last hour's gbfs for this provider
                const lastHourKey = `${year}/${month}/${day}/${lastHourTimestamp}-${provider}.geojson`;
                const getObject = await s3.send(
                    new GetObjectCommand({
                        Bucket: bucketName,
                        Key: lastHourKey,
                    }),
                );

                const contents = await getObject.Body?.transformToString();
                const lastSnapshot: LimeApiResponse = JSON.parse(contents ?? '');

                // calculate bikeIDs in each zone last hour from last gbfs
                lastSnapshot.data.bikes.forEach((bike) => {
                    const { lat, lon } = bike;
                    const zoneId = latLngToCell(lat, lon, 9);
                    if (!zoneId) return;
                    lastObj[zoneId] = lastObj[zoneId] ?? [];
                    lastObj[zoneId].push(bike.bike_id);
                });
            }

            // calculate bikeIDs in each zone current hour from current gbfs
            const currentObj: { [zoneId: string]: string[] } = {};
            feed.data.bikes.forEach((bike) => {
                const { lat, lon } = bike;
                const zoneId = latLngToCell(lat, lon, 9);
                if (!zoneId) return;
                currentObj[zoneId] = currentObj[zoneId] ?? [];
                currentObj[zoneId].push(bike.bike_id);
            });

            const allZoneIds = new Set<string>([...Object.keys(lastObj), ...Object.keys(currentObj)]);

            // iterate over all seen zone IDs and calculate metrics
            for (const zoneId of allZoneIds) {
                const lastSnapshotBikeIds = lastObj[zoneId] ?? [];
                const bikeIds = currentObj[zoneId] ?? [];

                const density = bikeIds.length;

                // First hour of the day → delta must be 0
                const delta = isFirstHourOfDay ? 0 : density - lastSnapshotBikeIds.length;

                let churn = 0;
                // No churn on first hour either
                if (!isFirstHourOfDay && PROVIDERS_WITH_CHURN.includes(provider)) {
                    const uniqueOld = lastSnapshotBikeIds.filter((id) => !bikeIds.includes(id));
                    const uniqueNew = bikeIds.filter((id) => !lastSnapshotBikeIds.includes(id));
                    churn = uniqueOld.length + uniqueNew.length;
                }

                const metrics: ZoneMetrics = {
                    density,
                    delta,
                    churn,
                };

                if (!currentSnapshot[provider]) {
                    currentSnapshot[provider] = {};
                }

                currentSnapshot[provider]![zoneId] = metrics;
            }

            // save provider gbfs for this hour
            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: `${year}/${month}/${day}/${timestamp}-${provider}.geojson`,
                    Body: JSON.stringify(feed),
                    ContentType: 'application/json',
                }),
            );
        } catch (err) {
            console.log(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'some error happened',
                }),
            };
        }
    }

    // append current snapshot to multiHourSnapshot and save
    multiHourSnapshot[timestamp] = currentSnapshot;
    await s3.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: multiHourKey,
            Body: JSON.stringify(multiHourSnapshot),
            ContentType: 'application/json',
        }),
    );

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Processed ${timestamp} snapshot across ${feeds.length} feed(s)`,
        }),
    };
};
