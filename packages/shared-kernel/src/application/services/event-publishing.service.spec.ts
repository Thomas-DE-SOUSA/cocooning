import { AggregateRoot } from '../../domain/primitives/aggregate-root';
import { DomainEventBase } from '../../domain/primitives/domain-event';
import { EventId } from '../../domain/value-objects/event-id.vo';
import { FakeEventPublisherAdapter } from '../../testing/fake-event-publisher.adapter';
import { FakeLoggerAdapter } from '../../testing/fake-logger.adapter';
import { FakeUuidV7GeneratorProvider } from '../../testing/fake-uuid-v7-generator.provider';
import { EventPublishingService } from './event-publishing.service';

const OCCURRED_AT = new Date('2026-11-22T10:00:00.000Z');

class SampleHappenedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'sample.sample.happened' as const;

    constructor() {
        super({
            eventName: SampleHappenedEvent.EVENT_NAME,
            aggregateId: 'sample-1',
            context: { coupleId: 'couple-1', userId: 'partner-1' },
            data: null,
            occurredAt: OCCURRED_AT,
        });
    }
}

class Sample extends AggregateRoot {
    happen(): void {
        this.addDomainEvent(new SampleHappenedEvent());
    }
}

const sampleWithOneEvent = (): Sample => {
    const sample = new Sample();
    sample.happen();
    return sample;
};

describe('Feature: publish the events of saved aggregates', () => {
    let publisher: FakeEventPublisherAdapter;
    let logger: FakeLoggerAdapter;
    let service: EventPublishingService;

    beforeEach(() => {
        EventId.configure(new FakeUuidV7GeneratorProvider());
        publisher = new FakeEventPublisherAdapter();
        logger = new FakeLoggerAdapter();
        service = new EventPublishingService(publisher, logger);
    });
    afterEach(() => EventId.resetForTests());

    describe('Scenario: publication succeeds', () => {
        it('publishes the events of every aggregate, then clears them', async () => {
            const first = sampleWithOneEvent();
            const second = sampleWithOneEvent();
            await service.publishAndClear([first, second]);
            expect(publisher.published.map((event) => event.eventId)).toEqual([
                '00000000-0000-7000-8000-000000000001',
                '00000000-0000-7000-8000-000000000002',
            ]);
            expect(first.hasUncommittedEvents()).toBe(false);
            expect(second.hasUncommittedEvents()).toBe(false);
        });
    });

    describe('Scenario: no event to publish', () => {
        it('publishes nothing', async () => {
            await service.publishAndClear([new Sample()]);
            expect(publisher.published).toEqual([]);
        });
    });

    describe('Scenario: publication fails', () => {
        it('clears the events, logs a warning with their ids and does not throw', async () => {
            const sample = sampleWithOneEvent();
            const failure = new Error('bus down');
            publisher.failWith(failure);
            await service.publishAndClear([sample]);
            expect(sample.hasUncommittedEvents()).toBe(false);
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message:
                        'In-process event publication failed, the outbox relay will deliver',
                    context: {
                        eventIds: ['00000000-0000-7000-8000-000000000001'],
                        error: failure,
                    },
                },
            ]);
        });
    });
});
