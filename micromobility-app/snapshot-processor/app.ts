import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand, _Object } from '@aws-sdk/client-s3';
import axios, { AxiosResponse } from 'axios';

import { point } from '@turf/helpers';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

import { geojsonRbush } from '@turf/geojson-rbush';
import { nearestPointOnLine } from '@turf/nearest-point-on-line';
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString, Polygon } from 'geojson';
import { parseDateString } from '../helper';
import { LimeApiResponse, ZoneType } from './types';
import { buffer } from '@turf/buffer';
import { latLngToCell } from 'h3-js';

const s3 = new S3Client({});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bucketName = 'micromobility-snapshots';
    const zoneTypeArray: ZoneType[] = [ZoneType.ZoneH3_9];
    const timestamp = new Date()
        .toLocaleString('sv-SE', {
            timeZone: 'America/New_York',
            hour12: false,
        })
        .slice(0, 16)
        .replace(' ', 'T');

    const response: AxiosResponse = await axios.get(
        'https://data.lime.bike/api/partners/v1/gbfs/washington_dc/free_bike_status.json',
    );
    const snapshot: LimeApiResponse = response.data;

    for (const zoneType of zoneTypeArray) {
        const key = `zones-${zoneType}.geojson`;

        try {
            // Load zone boundaries
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            const s3response = await s3.send(command);
            const zonesGeoJSONString = await s3response.Body?.transformToString();
            const zonesGeoJSON: FeatureCollection = JSON.parse(zonesGeoJSONString!);

            const obj: { [zoneId: string]: number } = {};

            console.log(`insert: calculating densities for ${zoneType} at ${timestamp}`);

            snapshot.data.bikes.forEach((bike) => {
                const { lat, lon } = bike;

                let zoneId: string | undefined = latLngToCell(lat, lon, 9);

                if (zoneId) obj[zoneId] = (obj[zoneId] || 0) + 1;
            });

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

            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: `${year}/${month}/${day}/${timestamp}.geojson`,
                    Body: JSON.stringify(snapshot),
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
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Processed ${timestamp} snapshot across ${zoneTypeArray.length} zone types.`,
        }),
    };
};
