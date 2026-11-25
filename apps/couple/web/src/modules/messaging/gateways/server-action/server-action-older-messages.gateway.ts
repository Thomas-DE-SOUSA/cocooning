import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { OlderMessagesGateway } from '../ports/older-messages.gateway';

export type OlderMessagesAction = (
    cursor: string,
) => Promise<Result<MessageFeedPageResponse, ApiError>>;

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Messaging server action unreachable',
    backendCode: null,
};

export class ServerActionOlderMessagesGateway extends OlderMessagesGateway {
    constructor(private readonly action: OlderMessagesAction) {
        super();
    }

    override listOlderMessages(
        cursor: string,
    ): Promise<Result<MessageFeedPageResponse, ApiError>> {
        return runServerAction(() => this.action(cursor), UNREACHABLE);
    }
}
