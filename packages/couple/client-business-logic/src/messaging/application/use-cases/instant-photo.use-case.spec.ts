import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakeInstantPhotoGateway } from '../../../testing/fake-instant-photo.gateway';
import {
    A_HIDDEN_PHOTO_OF_THE_DAY,
    AN_INSTANT_PHOTO,
    AN_INSTANT_PHOTO_FILE,
    AN_INSTANT_PHOTO_UPLOAD,
} from '../../../testing/messaging-fixtures';
import { GetInstantPhotoFileUseCase } from './get-instant-photo-file.use-case';
import { SendInstantPhotoUseCase } from './send-instant-photo.use-case';
import { WithdrawInstantPhotoUseCase } from './withdraw-instant-photo.use-case';

const HIDDEN = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Instant photo not found',
    backendCode: 'INSTANT_PHOTO_NOT_FOUND',
};

describe('Feature: the instant photos of the couple from the PWA', () => {
    let gateway: FakeInstantPhotoGateway;

    beforeEach(() => {
        gateway = new FakeInstantPhotoGateway();
    });

    it('sends a spontaneous photo, reads its bytes, then withdraws it (R3, R5, R6)', async () => {
        const { id } = AN_INSTANT_PHOTO;
        await expect(
            new SendInstantPhotoUseCase(gateway).execute(
                AN_INSTANT_PHOTO_UPLOAD,
            ),
        ).resolves.toEqual(ok(AN_INSTANT_PHOTO));
        await expect(
            new GetInstantPhotoFileUseCase(gateway).execute(id),
        ).resolves.toEqual(ok(AN_INSTANT_PHOTO_FILE));
        await expect(
            new WithdrawInstantPhotoUseCase(gateway).execute(id),
        ).resolves.toEqual(ok(null));
        expect(gateway.calls).toEqual([
            { operation: 'sendInstantPhoto', photo: AN_INSTANT_PHOTO_UPLOAD },
            { operation: 'getInstantPhotoFile', instantPhotoId: id },
            { operation: 'withdrawInstantPhoto', instantPhotoId: id },
        ]);
    });

    it('returns NOT_FOUND for the hidden photo of the day of the other (R9)', async () => {
        gateway.givenRefusal(HIDDEN);
        await expect(
            new GetInstantPhotoFileUseCase(gateway).execute(
                A_HIDDEN_PHOTO_OF_THE_DAY.id,
            ),
        ).resolves.toEqual(fail(HIDDEN));
    });
});
