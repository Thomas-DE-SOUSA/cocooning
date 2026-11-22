import { EventId } from '../value-objects/event-id.vo';
import { FakeUuidV7GeneratorProvider } from '../../testing/fake-uuid-v7-generator.provider';
import { AggregateRoot } from './aggregate-root';
import { DomainEventBase } from './domain-event';

const OCCURRED_AT = new Date('2026-11-22T10:00:00.000Z');
const CONTEXT = { coupleId: 'couple-1', userId: 'partner-1' };

class SampleHappenedEvent extends DomainEventBase<{ readonly label: string }> {
    static readonly EVENT_NAME = 'sample.sample.happened' as const;

    constructor(aggregateId: string, label: string, occurredAt: Date) {
        super({
            eventName: SampleHappenedEvent.EVENT_NAME,
            aggregateId,
            context: CONTEXT,
            data: { label },
            occurredAt,
        });
    }
}

class Sample extends AggregateRoot {
    happen(label: string, now: Date): void {
        this.addDomainEvent(new SampleHappenedEvent('sample-1', label, now));
    }
}

describe('Feature: aggregate event buffer', () => {
    beforeEach(() => EventId.configure(new FakeUuidV7GeneratorProvider()));
    afterEach(() => EventId.resetForTests());

    describe('Scenario: a mutation records an event', () => {
        it('exposes a deterministic event', () => {
            const sample = new Sample();
            sample.happen('first', OCCURRED_AT);
            expect(sample.hasUncommittedEvents()).toBe(true);
            expect(sample.getDomainEvents()).toEqual([
                expect.objectContaining({
                    eventId: '00000000-0000-7000-8000-000000000001',
                    eventName: 'sample.sample.happened',
                    aggregateId: 'sample-1',
                    context: CONTEXT,
                    data: { label: 'first' },
                    occurredAt: OCCURRED_AT,
                }),
            ]);
        });

        it('returns a frozen copy of its events', () => {
            const sample = new Sample();
            sample.happen('first', OCCURRED_AT);
            expect(Object.isFrozen(sample.getDomainEvents())).toBe(true);
        });
    });

    describe('Scenario: events are cleared', () => {
        it('has no uncommitted event left', () => {
            const sample = new Sample();
            sample.happen('first', OCCURRED_AT);
            sample.clearDomainEvents();
            expect(sample.getDomainEvents()).toEqual([]);
            expect(sample.hasUncommittedEvents()).toBe(false);
        });
    });
});
