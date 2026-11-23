import {
    CancelCoupleUseCase,
    CreateCoupleUseCase,
    GetMyCoupleUseCase,
    JoinCoupleUseCase,
    RenewInvitationCodeUseCase,
} from '@cocooning/couple-client-business-logic/pairing';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolvePairingEndpoints } from './endpoints/pairing.endpoints';
import { ApiPairingGateway } from './gateways/api-pairing.gateway';

export type PairingModule = {
    readonly getMyCouple: GetMyCoupleUseCase;
    readonly createCouple: CreateCoupleUseCase;
    readonly joinCouple: JoinCoupleUseCase;
    readonly renewInvitationCode: RenewInvitationCodeUseCase;
    readonly cancelCouple: CancelCoupleUseCase;
};

// The gateway stays inside; getSessionToken is only called when a use case runs (decision 0036).
export function createPairingModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): PairingModule {
    const gateway = new ApiPairingGateway(
        resolvePairingEndpoints(apiBaseUrl),
        createCoupleHttpConfig(timeoutMs),
        getSessionToken,
    );
    return {
        getMyCouple: new GetMyCoupleUseCase(gateway),
        createCouple: new CreateCoupleUseCase(gateway),
        joinCouple: new JoinCoupleUseCase(gateway),
        renewInvitationCode: new RenewInvitationCodeUseCase(gateway),
        cancelCouple: new CancelCoupleUseCase(gateway),
    };
}
