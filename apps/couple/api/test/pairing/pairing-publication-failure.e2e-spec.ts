import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CoupleCreatedEvent } from '@cocooning/couple-server-business-logic/pairing';
import { EventPublisher } from '@cocooning/shared-kernel/ports';
import { FakeEventPublisherAdapter } from '@cocooning/shared-kernel/testing';
import { PairingTestApp } from './pairing-test-app';
import { coupleOf, PARTNER_A } from './pairing-test-data';

describe('Feature: the in-process publication fails (decision 0021)', () => {
    const publisher = new FakeEventPublisherAdapter();
    const pairing = new PairingTestApp([
        { provide: EventPublisher, useValue: publisher },
    ]);

    beforeAll(async () => {
        publisher.failWith(new Error('in-process publication down'));
        await pairing.start();
    });
    afterAll(() => pairing.stop());
    beforeEach(() => pairing.reset());

    describe('Scenario: a couple is created', () => {
        it('still answers 201 and leaves the event unpublished for the relay', async () => {
            const response = await pairing.createCouple(PARTNER_A);
            expect(response.status).toBe(201);
            const { coupleId } = coupleOf(response);
            const events = await readPairingEvents(pairing.prisma, coupleId);
            expect(events).toEqual([
                expect.objectContaining({
                    eventName: CoupleCreatedEvent.EVENT_NAME,
                    published: false,
                }),
            ]);
        });
    });
});
