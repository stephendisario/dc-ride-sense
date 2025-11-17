import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parseDateString } from '../lib/helper';
import { ZoneType } from '@shared/types';

const s3 = new S3Client({});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: env var
    const bucketName = 'micromobility-snapshots';

    const dateString: string | undefined = event?.queryStringParameters?.dateString;
    const zoneType: ZoneType | undefined = event?.queryStringParameters?.zoneType as ZoneType;

    if (!dateString || !zoneType) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            },
            body: JSON.stringify({
                message: 'start date required',
            }),
        };
    }

    const { year, month, day } = parseDateString(dateString);
    const key = `${year}/${month}/${day}/${zoneType}.json`;

    try {
        const getObject = await s3.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            }),
        );

        const body = await getObject.Body?.transformToString();
        const json = body ? JSON.parse(body) : {};

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            },
            body: JSON.stringify(json),
        };
    } catch (err: any) {
        if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                },
                body: JSON.stringify({}),
            };
        }

        console.error('S3 error:', err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            },
            body: JSON.stringify({ error: 'Failed to fetch S3 object' }),
        };
    }
};
