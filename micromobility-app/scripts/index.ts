import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { addDays } from 'date-fns';

async function enqueueAllChunks() {
    const sqs = new SQSClient({ region: 'us-east-1' });
    const QueueUrl = 'https://sqs.us-east-1.amazonaws.com/696600220270/snapshot-backfill-queue';

    const startDate = new Date('2025-11-08');
    const endDate = new Date('2025-11-11');

    const zoneType = 'h3-9';

    let current = startDate;

    while (current < endDate) {
        const next = addDays(current, 1);
        console.log(current, next);

        const payload = {
            date: current,
            zoneType,
        };

        const command = new SendMessageCommand({
            QueueUrl,
            MessageBody: JSON.stringify(payload),
        });

        await sqs.send(command);
        console.log(`Enqueued ${payload.date} - ${payload.zoneType}`);

        current = next;
    }
}

enqueueAllChunks();
