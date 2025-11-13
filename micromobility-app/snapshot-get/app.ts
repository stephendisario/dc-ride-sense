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
import { ZoneType } from '../snapshot-processor/types';

const s3 = new S3Client({});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //TODO: env var
    const bucketName = 'micromobility-snapshots';

    let dateString: string | undefined = event?.queryStringParameters?.dateString;

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

    try {
        //get list of files for given day
        const { year, month, day } = parseDateString(dateString);
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `${year}/${month}/${day}`,
        });
        const results = await s3.send(listCommand);

        //filter for files with zoneType
        const files = (results?.Contents ?? [])
            .map((obj) => obj.Key)
            .filter((key) => key?.endsWith(`${zoneType}.json`));
        console.log(files);

        const mergedData: Record<string, any> = {};

        //get contents of each snapshot, merge into one json
        await Promise.all(
            files.map(async (key) => {
                try {
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
                } catch (e) {
                    console.log(e);
                }
            }),
        );

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
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
