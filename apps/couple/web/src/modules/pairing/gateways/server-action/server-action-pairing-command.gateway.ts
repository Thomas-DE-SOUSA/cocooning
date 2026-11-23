import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { PairingCommandGateway } from '../ports/pairing-command.gateway';

export type PairingCommandAction = () => Promise<Result<null, ApiError>>;

export type PairingCommandActions = {
    readonly createCouple: PairingCommandAction;
    readonly joinCouple: (
        form: JoinCoupleForm,
    ) => Promise<Result<null, ApiError>>;
    readonly renewInvitationCode: PairingCommandAction;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Pairing server action unreachable',
    backendCode: null,
};

// The call rejects when the phone is offline or the page predates a deployment: the hook gets a Result either way.
async function runAction(
    action: PairingCommandAction,
): Promise<Result<null, ApiError>> {
    try {
        return await action();
    } catch {
        return fail(UNREACHABLE);
    }
}

export class ServerActionPairingCommandGateway extends PairingCommandGateway {
    constructor(private readonly actions: PairingCommandActions) {
        super();
    }

    override createCouple(): Promise<Result<null, ApiError>> {
        return runAction(this.actions.createCouple);
    }

    override joinCouple(form: JoinCoupleForm): Promise<Result<null, ApiError>> {
        return runAction(() => this.actions.joinCouple(form));
    }

    override renewInvitationCode(): Promise<Result<null, ApiError>> {
        return runAction(this.actions.renewInvitationCode);
    }
}
