import { SQSEvent } from 'aws-lambda';
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsV2Command,
    _Object,
    ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';

import { point } from '@turf/helpers';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

import { geojsonRbush } from '@turf/geojson-rbush';
import { nearestPointOnLine } from '@turf/nearest-point-on-line';
import { BBox, Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString, Polygon } from 'geojson';
import { parseDateString } from '../helper';
import { LimeApiResponse, ZoneType } from '../snapshot-processor/types';
import { latLngToCell } from 'h3-js';

const s3 = new S3Client({});
const bucketName = 'micromobility-snapshots';

const processSnapshotChunk = async (date: string, zoneType: ZoneType) => {
    let filesToProcess: string[] = [];
    const key = `zones-${zoneType}.geojson`;

    try {
        // load zone boundaries
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const s3response = await s3.send(command);
        const zonesGeoJSONString = await s3response.Body?.transformToString();
        const zonesGeoJSON: FeatureCollection = JSON.parse(zonesGeoJSONString!);

        // create rbush
        const tree = geojsonRbush(1);
        tree.load(zonesGeoJSON);

        let data: _Object[] = [];
        let promiseArray: Promise<ListObjectsV2CommandOutput>[] = [];
        let files: any = [];

        // get all s3 filenames for given day
        const { year, month, day } = parseDateString(date);
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `${year}/${month}/${day}`,
        });
        promiseArray.push(s3.send(listCommand));

        // filter for snapshot filenames
        const results = await Promise.all(promiseArray);
        data = results.flatMap((d) => d?.Contents ?? []);
        files = data.map((obj) => obj.Key).filter((key) => key?.endsWith(`.geojson`));

        console.log(files);

        if (data.length) filesToProcess = files;

        for (const fileKey of filesToProcess) {
            console.log(fileKey);
            const snapshotCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: fileKey,
            });
            const fileResponse = await s3.send(snapshotCommand);
            const snapshotStr = await fileResponse.Body?.transformToString();
            const snapshotData: LimeApiResponse = JSON.parse(snapshotStr!);

            //remove folders and filetype from key: i.e 2025/04/15/2025-04-15T12:00.geojson
            const fileTimestamp = fileKey.substring(11, fileKey.length - 8);

            let snapshotItem: any = { key: fileTimestamp, data: snapshotData };

            console.log('processing', snapshotItem);
            const snapshot = snapshotItem.data;
            const obj: { [zoneId: string]: number } = {};

            snapshot.data.bikes.forEach((bike: any) => {
                const { lat, lon } = bike;

                let zoneId: string | undefined = latLngToCell(lat, lon, 9);

                if (zoneId) obj[zoneId] = (obj[zoneId] || 0) + 1;
            });

            // Create timestamp, use key if available else current time
            const timestamp =
                snapshotItem.key ??
                new Date()
                    .toLocaleString('sv-SE', {
                        timeZone: 'America/New_York',
                        hour12: false,
                    })
                    .slice(0, 16)
                    .replace(' ', 'T');

            const { year, month, day } = parseDateString(timestamp);

            const body = JSON.stringify({ [`${timestamp}`]: obj });

            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: `${year}/${month}/${day}/${timestamp}-${zoneType}.json`,
                    Body: body,
                    ContentType: 'application/json',
                }),
            );
            snapshotItem = null;
        }
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Processed ${filesToProcess.length} snapshot(s) on ${date} for zone type ${zoneType}`,
        }),
    };
};

export const lambdaHandler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const message = JSON.parse(record.body);

        const { date, zoneType } = message;

        console.log(`Processing snapshot chunk: ${date} for zone type ${zoneType}`);
        await processSnapshotChunk(date, zoneType);
    }
};
