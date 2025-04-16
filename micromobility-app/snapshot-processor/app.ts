import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutRequest } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommandInput, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import axios, { AxiosResponse } from 'axios';
import { LimeApiResponse } from './types';

import { point } from '@turf/helpers';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

import { geojsonRbush } from '@turf/geojson-rbush';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import { parseDateString } from '../helper';

const s3 = new S3Client({});

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bucketName = 'micromobility-snapshots';
    const key = 'zones.geojson';

    try {
        const response: AxiosResponse = await axios.get(
            'https://data.lime.bike/api/partners/v1/gbfs/washington_dc/free_bike_status.json',
        );
        const snapshot: LimeApiResponse = response.data;

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const s3response = await s3.send(command);

        const zonesGeoJSONString = await s3response.Body?.transformToString();

        const zonesGeoJSON: FeatureCollection<Polygon> = JSON.parse(zonesGeoJSONString!);

        const tree = geojsonRbush();

        tree.load(zonesGeoJSON);

        const obj: {
            [zoneId: string]: number;
        } = {};

        snapshot.data.bikes.forEach((bike) => {
            const pt = point([bike.lon, bike.lat]);
            const candidates = tree.search(pt);
            const matchingZone = candidates.features.find((feature) =>
                booleanPointInPolygon(pt, feature as Feature<Polygon>),
            );

            if (obj[matchingZone?.properties?.id]) obj[matchingZone?.properties?.id] += 1;
            else obj[matchingZone?.properties?.id] = 1;
        });

        const fullDate = new Date()
            .toLocaleString('sv-SE', {
                timeZone: 'America/New_York',
                hour12: false,
            })
            .slice(0, 16)
            .replace(' ', 'T');

        const { year, month, day } = parseDateString(fullDate);

        const body = JSON.stringify({ [`${fullDate}`]: obj });
        await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: `${year}/${month}/${day}/${fullDate}.json`,
                Body: body,
                ContentType: 'application/json',
            }),
        );

        await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: `${year}/${month}/${day}/${fullDate}.geojson`,
                Body: JSON.stringify(snapshot),
                ContentType: 'application/json',
            }),
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'snapshot-processed',
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
