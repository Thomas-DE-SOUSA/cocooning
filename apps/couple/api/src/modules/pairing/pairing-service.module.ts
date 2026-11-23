import { Module } from '@nestjs/common';
import {
    CancelCoupleUseCase,
    CreateCoupleUseCase,
    GetMyCoupleUseCase,
    JoinCoupleUseCase,
    RenewInvitationCodeUseCase,
} from '@cocooning/couple-server-business-logic/pairing';
import { PairingSecondaryModule } from './pairing-secondary.module';
import { pairingUseCase } from './pairing-use-case.factory';

const useCases = [
    pairingUseCase(
        CreateCoupleUseCase,
        (d) =>
            new CreateCoupleUseCase(
                d.repository,
                d.preconditions,
                d.random,
                d.clock,
                d.publishing,
                d.invitationCodeLifetimeInHours,
            ),
    ),
    pairingUseCase(
        JoinCoupleUseCase,
        (d) =>
            new JoinCoupleUseCase(
                d.repository,
                d.preconditions,
                d.clock,
                d.publishing,
            ),
    ),
    pairingUseCase(
        RenewInvitationCodeUseCase,
        (d) =>
            new RenewInvitationCodeUseCase(
                d.repository,
                d.preconditions,
                d.random,
                d.clock,
                d.publishing,
                d.invitationCodeLifetimeInHours,
            ),
    ),
    pairingUseCase(
        CancelCoupleUseCase,
        (d) =>
            new CancelCoupleUseCase(
                d.repository,
                d.preconditions,
                d.clock,
                d.publishing,
            ),
    ),
    pairingUseCase(
        GetMyCoupleUseCase,
        (d) => new GetMyCoupleUseCase(d.preconditions),
    ),
];

@Module({
    imports: [PairingSecondaryModule],
    providers: useCases,
    exports: useCases.map(({ provide }) => provide),
})
export class PairingServiceModule {}
