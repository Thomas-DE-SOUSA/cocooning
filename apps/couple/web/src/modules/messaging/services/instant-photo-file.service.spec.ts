import { GetInstantPhotoFileUseCase } from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    AN_INSTANT_PHOTO,
    AN_INSTANT_PHOTO_FILE,
    FakeInstantPhotoGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { readInstantPhotoFile } from './instant-photo-file.service';

const aRefusal = (code: ApiError['code']): ApiError => ({
    code,
    message: 'Refused',
    backendCode: null,
});

describe('Feature: the bytes of a photo served by the PWA (R5, R9)', () => {
    let gateway: FakeInstantPhotoGateway;
    const read = (id: unknown) =>
        readInstantPhotoFile(id, new GetInstantPhotoFileUseCase(gateway));

    beforeEach(() => {
        gateway = new FakeInstantPhotoGateway();
    });

    it('gives the bytes of a visible photo with the format the API detected', async () => {
        expect(await read(AN_INSTANT_PHOTO.id)).toEqual({
            found: true,
            ...AN_INSTANT_PHOTO_FILE,
        });
    });

    it.each([
        ['a hidden photo of the day', ApiErrorCodeEnum.NOT_FOUND, 404],
        ['a refused session', ApiErrorCodeEnum.UNAUTHORIZED, 401],
        ['an API out of reach', ApiErrorCodeEnum.NETWORK_ERROR, 404],
    ])('answers %s with %i', async (_label, code, status) => {
        gateway.givenRefusal(aRefusal(code));

        expect(await read(AN_INSTANT_PHOTO.id)).toEqual({
            found: false,
            status,
        });
    });

    it('answers 404 to an id that is not a photo id, without calling the API', async () => {
        expect(await read('../../couple')).toEqual({
            found: false,
            status: 404,
        });
        expect(gateway.calls).toEqual([]);
    });
});
