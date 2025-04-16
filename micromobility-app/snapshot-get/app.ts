import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parseDateString } from '../helper';
import {
    _Object,
    GetObjectCommand,
    ListObjectsV2Command,
    ListObjectsV2CommandOutput,
    S3Client,
} from '@aws-sdk/client-s3';
import { addDays, formatDate } from 'date-fns';

const s3 = new S3Client({});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //TODO: env var
    const bucketName = 'micromobility-snapshots';

    let startDate: string | undefined = event?.queryStringParameters?.startDate;
    const endDate: string | undefined = event?.queryStringParameters?.endDate;

    if (!startDate) {
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

    let data: _Object[] = [];
    let promiseArray: Promise<ListObjectsV2CommandOutput>[] = [];

    try {
        while (endDate && startDate <= endDate) {
            console.log(startDate, endDate);
            const { year, month, day } = parseDateString(startDate);
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: `${year}/${month}/${day}`,
            });

            promiseArray.push(s3.send(listCommand));
            startDate = formatDate(addDays(startDate!, 1), 'yyyy-MM-dd');
        }

        const results = await Promise.all(promiseArray);

        data = results.flatMap((d) => d?.Contents ?? []);

        const files = data.map((obj) => obj.Key).filter((key) => key?.endsWith('.json'));

        console.log(files);

        const mergedData: Record<string, any> = {};

        await Promise.all(
            files.map(async (key) => {
                const getObject = await s3.send(
                    new GetObjectCommand({
                        Bucket: bucketName,
                        Key: key,
                    }),
                );

                const body = await getObject.Body?.transformToString();
                const json = JSON.parse(body ?? '');

                for (const [timestamp, data] of Object.entries(json)) {
                    mergedData[timestamp] = data;
                }
            }),
        );

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // or your frontend URL
                'Access-Control-Allow-Headers': '*', // or list specific headers
            },
            body: JSON.stringify(mergedData),
        };
    } catch (err) {
        console.error('S3 error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch S3 objects' }),
        };
    }
};
