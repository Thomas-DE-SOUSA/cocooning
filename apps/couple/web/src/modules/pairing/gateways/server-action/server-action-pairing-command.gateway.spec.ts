import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionPairingCommandGateway } from './server-action-pairing-command.gateway';

const answers = () => Promise.resolve(ok(null));
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

describe('Feature: pairing commands through the server actions', () => {
    it('gives the result of each action', async () => {
        const sent: string[] = [];
        const gateway = new ServerActionPairingCommandGateway({
            createCouple: answers,
            joinCouple: (form) => {
                sent.push(form.invitationCode);
                return answers();
            },
            renewInvitationCode: answers,
        });

        await expect(gateway.createCouple()).resolves.toEqual(ok(null));
        await expect(
            gateway.joinCouple({ invitationCode: 'K7M2Q9XR' }),
        ).resolves.toEqual(ok(null));
        expect(sent).toEqual(['K7M2Q9XR']);
        await expect(gateway.renewInvitationCode()).resolves.toEqual(ok(null));
    });

    it.each(['createCouple', 'joinCouple', 'renewInvitationCode'] as const)(
        'gives a network error instead of rejecting for %s',
        async (command) => {
            const gateway = new ServerActionPairingCommandGateway({
                createCouple: rejects,
                joinCouple: rejects,
                renewInvitationCode: rejects,
            });

            await expect(
                command === 'joinCouple'
                    ? gateway.joinCouple({ invitationCode: 'K7M2Q9XR' })
                    : gateway[command](),
            ).resolves.toEqual({
                success: false,
                error: expect.objectContaining({
                    code: ApiErrorCodeEnum.NETWORK_ERROR,
                }),
            });
        },
    );
});
