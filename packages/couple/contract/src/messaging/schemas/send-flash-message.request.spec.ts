import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { SendFlashMessageRequestSchema } from './send-flash-message.request';

describe('Feature: the body of a flash message (R2)', () => {
    it('keeps the text without the surrounding spaces', () => {
        expect(
            SendFlashMessageRequestSchema.parse({ text: "  Je t'aime  " }),
        ).toEqual({ text: "Je t'aime" });
    });

    it('accepts exactly FLASH_MESSAGE_TEXT_MAX_LENGTH signs', () => {
        const text = 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH);
        expect(SendFlashMessageRequestSchema.parse({ text })).toEqual({ text });
    });

    it.each([
        ['an empty text', ''],
        ['a text made of spaces', '   '],
        ['one sign too many', 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH + 1)],
    ])('rejects %s', (_label, text) => {
        expect(SendFlashMessageRequestSchema.safeParse({ text }).success).toBe(
            false,
        );
    });
});
