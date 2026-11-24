import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { FlashMessageText } from './flash-message-text.vo';

describe('Feature: the text of a flash message (R2)', () => {
    it('keeps what the partner typed, without the surrounding spaces', () => {
        expect(FlashMessageText.create("  Je t'aime  ").value).toBe(
            "Je t'aime",
        );
    });

    it('accepts exactly FLASH_MESSAGE_TEXT_MAX_LENGTH signs', () => {
        const text = 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH);
        expect(FlashMessageText.create(text).value).toBe(text);
    });

    it('reads a stored text back as is', () => {
        expect(FlashMessageText.from(' Bisous ').value).toBe(' Bisous ');
    });

    it.each([
        ['an empty text', ''],
        ['a text made of spaces', ' \n '],
        ['one sign too many', 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH + 1)],
    ])('refuses %s', (_label, raw) => {
        expect(() => FlashMessageText.create(raw)).toThrow(
            expect.objectContaining({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_TEXT_INVALID,
                context: { min: 1, max: FLASH_MESSAGE_TEXT_MAX_LENGTH },
            }),
        );
    });
});
