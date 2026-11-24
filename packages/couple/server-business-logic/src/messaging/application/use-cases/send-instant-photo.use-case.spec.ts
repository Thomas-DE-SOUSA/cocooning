import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { InstantPhotoSentEvent } from '../../domain/events/instant-photo-sent.event';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    COUPLE_ID,
    FIRST_ID,
    idNumber,
    JPEG,
    JPEG_PHOTO,
    NOW,
    PARTNER_A,
} from '../../__tests__/fixtures/messaging-test.data';

const FILE_KEY = `${COUPLE_ID}/instant-photos/${FIRST_ID}`;
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

describe('Feature: send an instant photo', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const send = (content: Uint8Array) =>
        ctx.sendInstantPhotoUseCase().execute(AS_A, { content });

    describe('Scenario: R1, R3, a partner sends a photo of the phone camera', () => {
        it('returns the photo, owned by its author, typed by its bytes', async () => {
            await expect(send(JPEG_PHOTO)).resolves.toEqual({
                type: 'INSTANT_PHOTO',
                id: FIRST_ID,
                ownerId: PARTNER_A,
                isOwner: true,
                sentAt: NOW,
                contentType: JPEG,
                photoPromptId: null,
                isLate: false,
                isHidden: false,
            });
        });

        it('stores the photo in its couple, at version 1', async () => {
            await send(JPEG_PHOTO);
            expect(ctx.instantPhotoRepository.storedSnapshots).toEqual([
                {
                    id: FIRST_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    contentType: JPEG,
                    photoPromptId: null,
                    isLate: false,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('stores its bytes under a key that starts with the couple (decision 0027)', async () => {
            await send(JPEG_PHOTO);
            await expect(ctx.fileStorage.read(FILE_KEY)).resolves.toEqual({
                key: FILE_KEY,
                content: JPEG_PHOTO,
                contentType: JPEG,
            });
        });

        it('persists then publishes one sent event, without the bytes', async () => {
            await send(JPEG_PHOTO);
            const expected = {
                eventId: idNumber(2),
                eventName: InstantPhotoSentEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: { ownerId: PARTNER_A },
                occurredAt: NOW,
            };
            expect(ctx.instantPhotoRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R3, a file that is not an accepted photo', () => {
        it('refuses it, and stores neither the row nor the file', async () => {
            await expect(send(GIF)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
            });
            expect(ctx.instantPhotoRepository.storedSnapshots).toEqual([]);
            expect(ctx.instantPhotoRepository.persistedEvents).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
            await expect(ctx.fileStorage.read(FILE_KEY)).resolves.toBeNull();
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the photo, its file and its event, and logs one warning', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            await send(JPEG_PHOTO);
            expect(ctx.instantPhotoRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.instantPhotoRepository.persistedEvents).toHaveLength(1);
            await expect(
                ctx.fileStorage.read(FILE_KEY),
            ).resolves.not.toBeNull();
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
