import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutRequest } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommandInput, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import axios, { AxiosResponse } from 'axios';
import { LimeApiResponse, ZoneType } from './types';

import { point } from '@turf/helpers';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

import { geojsonRbush } from '@turf/geojson-rbush';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import { parseDateString } from '../helper';

const s3 = new S3Client({});

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const zoneType: ZoneType = (event?.queryStringParameters?.zoneType as ZoneType) || '300m';
    const bucketName = 'micromobility-snapshots';
    const key = `zones-${zoneType}.geojson`;

    try {
        // Load zone boundaries
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const s3response = await s3.send(command);
        const zonesGeoJSONString = await s3response.Body?.transformToString();
        const zonesGeoJSON: FeatureCollection<Polygon> = JSON.parse(zonesGeoJSONString!);

        const tree = geojsonRbush();
        tree.load(zonesGeoJSON);

        let body: any;

        // Determine if in batch mode
        try {
            console.log(event);
            body = typeof event?.body === 'string' ? JSON.parse(event?.body) : undefined;
        } catch (err) {
            console.error('Failed to parse body:', err);
            body = undefined;
        }

        let filesToProcess: string[] = [];
        if (body) filesToProcess = body;

        // If no input provided, use live Lime data
        const snapshots: { key: string | null; data: LimeApiResponse }[] = [];

        if (filesToProcess.length > 0) {
            for (const fileKey of filesToProcess) {
                const snapshotCommand = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                });
                const fileResponse = await s3.send(snapshotCommand);
                const snapshotStr = await fileResponse.Body?.transformToString();
                const snapshotData: LimeApiResponse = JSON.parse(snapshotStr!);

                //remove folders and filetype from key: i.e 2025/04/15/2025-04-15T12:00.geojson
                const fileTimestamp = fileKey.substring(11, fileKey.length - 8);

                snapshots.push({ key: fileTimestamp, data: snapshotData });
            }
        } else {
            const response: AxiosResponse = await axios.get(
                'https://data.lime.bike/api/partners/v1/gbfs/washington_dc/free_bike_status.json',
            );
            snapshots.push({
                key: null,
                data: response.data,
            });
        }

        for (const snapshotItem of snapshots) {
            console.log('processing', snapshotItem);
            const snapshot = snapshotItem.data;
            const obj: { [zoneId: string]: number } = {};

            snapshot.data.bikes.forEach((bike) => {
                const pt = point([bike.lon, bike.lat]);
                const candidates = tree.search(pt);
                const matchingZone = candidates.features.find((feature) =>
                    booleanPointInPolygon(pt, feature as Feature<Polygon>),
                );

                const zoneId = matchingZone?.properties?.id;
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

            // If batch processing, assume file is already saved
            if (!snapshotItem.key) {
                await s3.send(
                    new PutObjectCommand({
                        Bucket: bucketName,
                        Key: `${year}/${month}/${day}/${timestamp}.geojson`,
                        Body: JSON.stringify(snapshot),
                        ContentType: 'application/json',
                    }),
                );
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Processed ${snapshots.length} snapshot(s)`,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
