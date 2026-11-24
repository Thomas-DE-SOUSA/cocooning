import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakeFlashMessageGateway } from '../../../testing/fake-flash-message.gateway';
import { FakeMessageFeedGateway } from '../../../testing/fake-message-feed.gateway';
import {
    A_FLASH_MESSAGE,
    A_MESSAGE_FEED_PAGE,
} from '../../../testing/messaging-fixtures';
import { ListMessageFeedUseCase } from './list-message-feed.use-case';
import { SendFlashMessageUseCase } from './send-flash-message.use-case';
import { WithdrawFlashMessageUseCase } from './withdraw-flash-message.use-case';

const NOT_PAIRED = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Couple not paired',
    backendCode: 'MESSAGING_COUPLE_NOT_PAIRED',
};
const RESERVED = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to the owner of the flash message',
    backendCode: 'FLASH_MESSAGE_RESERVED_TO_OWNER',
};

describe('Feature: the feed and the flash messages of the couple from the PWA', () => {
    it('lists one page of the feed after a cursor (R5)', async () => {
        const gateway = new FakeMessageFeedGateway();
        const query = { cursor: A_FLASH_MESSAGE.id, limit: 25 };
        await expect(
            new ListMessageFeedUseCase(gateway).execute(query),
        ).resolves.toEqual(ok(A_MESSAGE_FEED_PAGE));
        expect(gateway.queries).toEqual([query]);
    });

    it('returns the refusal of the feed unchanged (R4)', async () => {
        const gateway = new FakeMessageFeedGateway();
        gateway.givenRefusal(NOT_PAIRED);
        await expect(
            new ListMessageFeedUseCase(gateway).execute({
                cursor: null,
                limit: 25,
            }),
        ).resolves.toEqual(fail(NOT_PAIRED));
    });

    it('sends the text of the form, then withdraws the word (R2, R6)', async () => {
        const gateway = new FakeFlashMessageGateway();
        await expect(
            new SendFlashMessageUseCase(gateway).execute({ text: 'Bisous' }),
        ).resolves.toEqual(ok({ ...A_FLASH_MESSAGE, text: 'Bisous' }));
        await new WithdrawFlashMessageUseCase(gateway).execute(
            A_FLASH_MESSAGE.id,
        );
        expect(gateway.calls).toEqual([
            { operation: 'sendFlashMessage', request: { text: 'Bisous' } },
            {
                operation: 'withdrawFlashMessage',
                flashMessageId: A_FLASH_MESSAGE.id,
            },
        ]);
    });

    it('returns the refusal of a withdrawal unchanged (R6)', async () => {
        const gateway = new FakeFlashMessageGateway();
        gateway.givenRefusal(RESERVED);
        await expect(
            new WithdrawFlashMessageUseCase(gateway).execute(
                A_FLASH_MESSAGE.id,
            ),
        ).resolves.toEqual(fail(RESERVED));
    });
});
