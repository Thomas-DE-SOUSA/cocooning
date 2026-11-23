import { ok } from '@cocooning/shared-kernel/utils';
import {
    A_PENDING_COUPLE,
    FakePairingGateway,
} from '../../../testing/fake-pairing.gateway';
import { RenewInvitationCodeUseCase } from './renew-invitation-code.use-case';

describe('Feature: R7, the creator renews the invitation code', () => {
    it('returns the couple with its new code', async () => {
        const gateway = new FakePairingGateway();

        await expect(
            new RenewInvitationCodeUseCase(gateway).execute(),
        ).resolves.toEqual(ok(A_PENDING_COUPLE));
        expect(gateway.calls).toEqual([{ operation: 'renewInvitationCode' }]);
    });
});
