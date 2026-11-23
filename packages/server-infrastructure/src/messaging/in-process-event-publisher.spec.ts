import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import { InProcessEventPublisher } from './in-process-event-publisher';

const EVENT: DomainEvent<{ readonly secret: string }> = {
    eventId: '00000000-0000-7000-8000-000000000001',
    eventName: 'sample.sample.happened',
    aggregateId: '00000000-0000-7000-8000-000000000002',
    context: {
        coupleId: '00000000-0000-7000-8000-000000000002',
        userId: '00000000-0000-7000-8000-000000000003',
    },
    data: { secret: 'never logged' },
    occurredAt: new Date('2026-11-23T10:00:00.000Z'),
};

describe('Feature: publish domain events in process', () => {
    describe('Scenario: a saved aggregate publishes its events', () => {
        it('logs each event by its identifiers, never its data', async () => {
            const logger = new FakeLoggerAdapter();
            await new InProcessEventPublisher(logger).publish([EVENT]);
            expect(logger.entries).toEqual([
                {
                    level: 'debug',
                    message: 'Event published in process',
                    context: {
                        eventId: EVENT.eventId,
                        eventName: EVENT.eventName,
                        aggregateId: EVENT.aggregateId,
                    },
                },
            ]);
        });
    });
});
