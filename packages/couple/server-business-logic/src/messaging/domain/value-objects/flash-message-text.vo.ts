import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../exceptions/messaging.exception';

type FlashMessageTextProps = {
    readonly value: string;
};

export class FlashMessageText extends ValueObject<FlashMessageTextProps> {
    private constructor(props: FlashMessageTextProps) {
        super(props);
        Object.freeze(this);
    }

    // R2: what a partner typed or touched, trimmed, never empty, at most FLASH_MESSAGE_TEXT_MAX_LENGTH signs.
    static create(raw: string): FlashMessageText {
        const value = raw.trim();
        if (
            value.length === 0 ||
            value.length > FLASH_MESSAGE_TEXT_MAX_LENGTH
        ) {
            throw new MessagingException({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_TEXT_INVALID,
                message: 'Invalid flash message text',
                context: { min: 1, max: FLASH_MESSAGE_TEXT_MAX_LENGTH },
            });
        }
        return new FlashMessageText({ value });
    }

    static from(value: string): FlashMessageText {
        return new FlashMessageText({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
