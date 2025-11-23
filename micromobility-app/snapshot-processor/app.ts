import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
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

    console.log('timestamp, lastHourTimestamp', timestamp, lastHourTimestamp);

    const { year, month, day } = parseDateString(timestamp);

    // Previous hour parsed for last hour GBFS
    const { year: lastYear, month: lastMonth, day: lastDay } = parseDateString(lastHourTimestamp);

    // fetch GBFS feeds for this hour, but don't let one failure kill the run
    const results = await Promise.allSettled(
        GBFS_URLS.map((url) =>
            axios.get<LimeApiResponse>(url, {
                timeout: 10_000,
            }),
        ),
    );

    const feeds: ApiResponseWrapper[] = [];

    results.forEach((result, i) => {
        const provider = PROVIDERS[i];
        if (result.status === 'fulfilled') {
            feeds.push({
                feed: result.value.data,
                provider,
            });
        } else {
            console.error('GBFS fetch failed for provider', provider, result.reason);
            // Skip this provider for this hour
        }
    });

    if (feeds.length === 0) {
        console.error('All GBFS providers failed for this hour, aborting.');
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'All GBFS providers failed for this hour',
            }),
        };
    }

    // Load multi-hour snapshot (append current hour)
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

    // Process each successful provider
    for (const { feed, provider } of feeds) {
        try {
            const lastObj: { [zoneId: string]: string[] } = {};
            let hadPrevSnapshot = false;

            // Try to load last hour's GBFS for this provider
            try {
                const lastHourKey = `${lastYear}/${lastMonth}/${lastDay}/${lastHourTimestamp}-${provider}.geojson`;
                const getObject = await s3.send(
                    new GetObjectCommand({
                        Bucket: bucketName,
                        Key: lastHourKey,
                    }),
                );

                const contents = await getObject.Body?.transformToString();
                if (contents) {
                    const lastSnapshot: LimeApiResponse = JSON.parse(contents);

                    // calculate bikeIDs in each zone last hour from last gbfs
                    lastSnapshot.data.bikes.forEach((bike) => {
                        const { lat, lon } = bike;
                        const zoneId = latLngToCell(lat, lon, 9);
                        if (!zoneId) return;
                        lastObj[zoneId] = lastObj[zoneId] ?? [];
                        lastObj[zoneId].push(bike.bike_id);
                    });

                    hadPrevSnapshot = true;
                }
            } catch (err: any) {
                if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
                    console.log(
                        `No previous GBFS for provider=${provider} at ${lastHourTimestamp}, ` +
                            'treating as zero baseline for delta/churn',
                    );
                    // hadPrevSnapshot stays false, lastObj stays empty
                } else {
                    throw err;
                }
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

                // If we had a previous snapshot, compute real delta
                // If not (previous GBFS missing), delta should be 0.
                const delta = hadPrevSnapshot ? density - lastSnapshotBikeIds.length : 0;

                let churn = 0;
                if (hadPrevSnapshot && PROVIDERS_WITH_CHURN.includes(provider)) {
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
            console.error('Error processing provider', provider, err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'some error happened',
                }),
            };
        }
    }

    // Append current snapshot to multiHourSnapshot and save
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
            message: `Processed ${timestamp} snapshot across ${feeds.length} successful feed(s)`,
        }),
    };
};
