import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    FIRST_ID,
    JPEG,
    JPEG_PHOTO,
} from '../../__tests__/fixtures/messaging-test.data';

const FILE_KEY = `${COUPLE_ID}/instant-photos/${FIRST_ID}`;

describe('Feature: read the file of an instant photo', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const read = (context: ExecutionContext) =>
        ctx
            .getInstantPhotoFileUseCase()
            .execute(context, { instantPhotoId: FIRST_ID });

    describe('Scenario: R5, a partner of the couple opens a photo', () => {
        it.each([
            ['its author', AS_A],
            ['the other partner', AS_B],
        ])(
            'gives %s the bytes and their content type',
            async (_label, context) => {
                await ctx.givenInstantPhotoOf(AS_A);
                await expect(read(context)).resolves.toEqual({
                    content: JPEG_PHOTO,
                    contentType: JPEG,
                });
            },
        );
    });

    describe('Scenario: a photo the partner cannot reach', () => {
        it('answers not found to another couple (core.md rule 27)', async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            await expect(read(AS_STRANGER)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
            });
        });

        it('answers not found once withdrawn (R6)', async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            await ctx
                .withdrawInstantPhotoUseCase()
                .execute(AS_A, { instantPhotoId: FIRST_ID });
            await expect(read(AS_B)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
            });
        });
    });

    describe('Scenario: the file of a live photo is gone', () => {
        it("answers corrupted data, never the partner's fault", async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            await ctx.fileStorage.delete(FILE_KEY);
            await expect(read(AS_B)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_DATA_CORRUPTED,
            });
        });
    });

    describe("Scenario: R9, the partner's photo of the day", () => {
        const readPhoto = (context: ExecutionContext, instantPhotoId: string) =>
            ctx
                .getInstantPhotoFileUseCase()
                .execute(context, { instantPhotoId });

        it('answers not found to a reader who has not sent theirs', async () => {
            const photoPrompt = ctx.givenPhotoPromptOf(COUPLE_ID);
            const photo = await ctx.givenPhotoOfTheDayOf(AS_A, photoPrompt);
            await expect(
                readPhoto(AS_B, photo.id.getValue()),
            ).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
            });
        });

        it('gives the bytes to its author, and to the reader who has sent theirs', async () => {
            const photoPrompt = ctx.givenPhotoPromptOf(COUPLE_ID);
            const photo = await ctx.givenPhotoOfTheDayOf(AS_A, photoPrompt);
            const id = photo.id.getValue();
            await expect(readPhoto(AS_A, id)).resolves.toMatchObject({
                contentType: JPEG,
            });
            await ctx.givenPhotoOfTheDayOf(AS_B, photoPrompt);
            await expect(readPhoto(AS_B, id)).resolves.toEqual({
                content: JPEG_PHOTO,
                contentType: JPEG,
            });
        });
    });
});
