import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { PairingCommandGateway } from '../ports/pairing-command.gateway';

export type PairingCommandAction = () => Promise<Result<null, ApiError>>;

export type PairingCommandActions = {
    readonly createCouple: PairingCommandAction;
    readonly joinCouple: (
        form: JoinCoupleForm,
    ) => Promise<Result<null, ApiError>>;
    readonly renewInvitationCode: PairingCommandAction;
    readonly cancelCouple: PairingCommandAction;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Pairing server action unreachable',
    backendCode: null,
};

export class ServerActionPairingCommandGateway extends PairingCommandGateway {
    constructor(private readonly actions: PairingCommandActions) {
        super();
    }

    override createCouple(): Promise<Result<null, ApiError>> {
        return runServerAction(this.actions.createCouple, UNREACHABLE);
    }

    override joinCouple(form: JoinCoupleForm): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.joinCouple(form),
            UNREACHABLE,
        );
    }

    override renewInvitationCode(): Promise<Result<null, ApiError>> {
        return runServerAction(this.actions.renewInvitationCode, UNREACHABLE);
    }

    override cancelCouple(): Promise<Result<null, ApiError>> {
        return runServerAction(this.actions.cancelCouple, UNREACHABLE);
    }
}
