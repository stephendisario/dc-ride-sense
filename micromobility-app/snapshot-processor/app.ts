import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import axios, { AxiosResponse } from 'axios';
import { formatEastern, parseDateString, setMinutesToZero } from '../helper';
import {
    ApiResponseWrapper,
    LimeApiResponse,
    Providers,
    Snapshot,
    TimestampSnapshot,
    ZoneMetrics,
    ZoneType,
} from '@shared/types';
import { latLngToCell } from 'h3-js';
import { subHours } from 'date-fns';

const s3 = new S3Client({});

const GBFS_URLS = [
    'https://data.lime.bike/api/partners/v1/gbfs/washington_dc/free_bike_status.json',
    'https://cluster-prod.veoride.com/api/shares/name/xdc/gbfs/free_bike_status',
    'https://mds.bolt.eu/gbfs/2/23/free_bike_status',
];

const PROVIDERS = [Providers.LIME, Providers.VEO, Providers.HOPP];
const PROVIDER_WITH_CHURN = [Providers.VEO, Providers.HOPP];
const zoneType = ZoneType.ZoneH3_9;

//Calculate ZoneMetrics for given providers every hour
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bucketName = 'micromobility-snapshots';
    const now = new Date();

    const timestamp = formatEastern(now);
    const lastHourTimestamp = setMinutesToZero(formatEastern(subHours(now, 1)));

    const easternHour = Number(timestamp.slice(11, 13));

    console.log(timestamp, lastHourTimestamp, easternHour);

    const { year, month, day } = parseDateString(timestamp);

    //fetch gbfs feeds for this hour
    const responses: AxiosResponse[] = await Promise.all(GBFS_URLS.map((url) => axios.get(url)));
    const feeds: ApiResponseWrapper[] = responses.map((r, i) => ({ feed: r.data, provider: PROVIDERS[i] }));

    //if first snapshot of the day, save gbfs and no metrics, return early
    if (easternHour === 0) {
        for (const { feed, provider } of feeds) {
            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: `${year}/${month}/${day}/${timestamp}-${provider}.geojson`,
                    Body: JSON.stringify(feed),
                    ContentType: 'application/json',
                }),
            );
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `First Hour: Processed ${timestamp} snapshot across ${feeds.length} feed(s)`,
            }),
        };
    }

    //fetch multi hour snapshot, will append current hour to this
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
        multiHourSnapshot = JSON.parse(multiHourBody ?? '');
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
            //get last hours gbfs for provider
            const lastHourKey = `${year}/${month}/${day}/${lastHourTimestamp}-${provider}.geojson`;
            const getObject = await s3.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: lastHourKey,
                }),
            );

            const contents = await getObject.Body?.transformToString();
            const lastSnapshot: LimeApiResponse = JSON.parse(contents ?? '');

            //calculate bikeID's in each zone last hour from last gbfs
            const lastObj: { [zoneId: string]: string[] } = {};
            lastSnapshot.data.bikes.forEach((bike) => {
                const { lat, lon } = bike;
                let zoneId: string | undefined = latLngToCell(lat, lon, 9);
                if (!zoneId) return;
                lastObj[zoneId] = lastObj[zoneId] ?? [];
                lastObj[zoneId].push(bike.bike_id);
            });

            const currentObj: { [zoneId: string]: string[] } = {};

            //calculate bikeID's in each zone current hour from current gbfs
            feed.data.bikes.forEach((bike) => {
                const { lat, lon } = bike;
                let zoneId: string | undefined = latLngToCell(lat, lon, 9);
                if (!zoneId) return;
                currentObj[zoneId] = currentObj[zoneId] ?? [];
                currentObj[zoneId].push(bike.bike_id);
            });

            const allZoneIds = new Set<string>([...Object.keys(lastObj), ...Object.keys(currentObj)]);

            //iterate over all seen zone ID's and calculate metrics
            for (const zoneId of allZoneIds) {
                const lastSnapshotBikeIds = lastObj[zoneId] ?? [];
                const bikeIds = currentObj[zoneId] ?? [];

                const density = bikeIds.length;
                const delta = bikeIds.length - lastSnapshotBikeIds.length;

                let churn = undefined;
                if (PROVIDER_WITH_CHURN.includes(provider)) {
                    const uniqueOld = lastSnapshotBikeIds.filter((id) => !bikeIds.includes(id));
                    const uniqueNew = bikeIds.filter((id) => !lastSnapshotBikeIds.includes(id));
                    churn = uniqueOld.length + uniqueNew.length;
                }

                const metrics: ZoneMetrics = {
                    density,
                    delta,
                    churn: churn === undefined ? 0 : churn,
                };

                if (!currentSnapshot[provider]) {
                    currentSnapshot[provider] = {};
                }

                currentSnapshot[provider][zoneId] = metrics;

                if (!currentSnapshot[Providers.TOTAL]) {
                    currentSnapshot[Providers.TOTAL] = {};
                }

                if (!currentSnapshot[Providers.TOTAL][zoneId]) {
                    currentSnapshot[Providers.TOTAL][zoneId] = { ...metrics };
                } else {
                    const totalMetrics = currentSnapshot[Providers.TOTAL][zoneId];
                    totalMetrics.density += metrics.density;
                    totalMetrics.delta += metrics.delta;
                    totalMetrics.churn += metrics.churn;
                }
            }

            //save provider gbfs
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

    //append current snapshot to multihoursnapshot
    multiHourSnapshot[timestamp] = currentSnapshot;
    const body = JSON.stringify(multiHourSnapshot);
    await s3.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: `${year}/${month}/${day}/${zoneType}.json`,
            Body: body,
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
