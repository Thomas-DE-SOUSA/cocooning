import {
    FakeSecureRandomGenerator,
    FakeUuidV7GeneratorProvider,
} from '@cocooning/shared-kernel/testing';
import { PhotoPromptId } from '../value-objects/photo-prompt-id.vo';
import { PhotoPrompt } from './photo-prompt.aggregate';

const SEVEN_AM = new Date('2026-11-24T06:00:00.000Z');
const MIDNIGHT = new Date('2026-11-24T23:00:00.000Z');

// The scheduled task reads only today's prompts: these guards are out of reach of its use case (use-case-tests.md rule 15).
describe('Feature: a photo prompt is issued only on its own day (R7)', () => {
    let photoPrompt: PhotoPrompt;

    beforeEach(() => {
        PhotoPromptId.configure(new FakeUuidV7GeneratorProvider());
        photoPrompt = PhotoPrompt.draw(
            {
                coupleId: 'c0000000-0000-7000-8000-0000000000c1',
                day: '2026-11-24',
            },
            new FakeSecureRandomGenerator(),
            SEVEN_AM,
        );
        photoPrompt.clearDomainEvents();
    });
    afterEach(() => PhotoPromptId.resetForTests());

    describe('Scenario: the API was down from the drawn time until midnight', () => {
        it('never issues the prompt of a passed day', () => {
            photoPrompt.issueIfDue(MIDNIGHT);
            expect(photoPrompt.issuedAt).toBeNull();
            expect(photoPrompt.hasUncommittedEvents()).toBe(false);
        });

        it('still issues it one millisecond before midnight', () => {
            photoPrompt.issueIfDue(new Date(MIDNIGHT.getTime() - 1));
            expect(photoPrompt.issuedAt).toEqual(
                new Date('2026-11-24T22:59:59.999Z'),
            );
        });
    });

    describe('Scenario: a stored prompt is read back', () => {
        it('keeps its drawn time and its issue', () => {
            photoPrompt.issueIfDue(new Date('2026-11-24T09:00:00.000Z'));
            const snapshot = photoPrompt.toSnapshot();
            expect(PhotoPrompt.fromSnapshot(snapshot).toSnapshot()).toEqual(
                snapshot,
            );
        });
    });
});
