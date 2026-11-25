import { FlashMessageParamsRequestSchema } from './flash-message-params.request';
import { InstantPhotoParamsRequestSchema } from './instant-photo-params.request';
import { PhotoPromptParamsRequestSchema } from './photo-prompt-params.request';

const MESSAGE_ID = '01936b2e-7c4a-7000-8000-0000000000a1';

describe('Feature: the flash message named in a route', () => {
    it('accepts a UUID', () => {
        expect(
            FlashMessageParamsRequestSchema.parse({
                flashMessageId: MESSAGE_ID,
            }),
        ).toEqual({ flashMessageId: MESSAGE_ID });
    });

    it.each([['not-a-uuid'], ['']])('rejects %p', (flashMessageId) => {
        expect(
            FlashMessageParamsRequestSchema.safeParse({ flashMessageId })
                .success,
        ).toBe(false);
    });
});

describe('Feature: the instant photo named in a route', () => {
    it('accepts a UUID', () => {
        expect(
            InstantPhotoParamsRequestSchema.parse({
                instantPhotoId: MESSAGE_ID,
            }),
        ).toEqual({ instantPhotoId: MESSAGE_ID });
    });

    it.each([['not-a-uuid'], ['']])('rejects %p', (instantPhotoId) => {
        expect(
            InstantPhotoParamsRequestSchema.safeParse({ instantPhotoId })
                .success,
        ).toBe(false);
    });
});

describe('Feature: the photo prompt named in a route', () => {
    it('accepts a UUID', () => {
        expect(
            PhotoPromptParamsRequestSchema.parse({ photoPromptId: MESSAGE_ID }),
        ).toEqual({ photoPromptId: MESSAGE_ID });
    });

    it.each([['not-a-uuid'], ['']])('rejects %p', (photoPromptId) => {
        expect(
            PhotoPromptParamsRequestSchema.safeParse({ photoPromptId }).success,
        ).toBe(false);
    });
});
