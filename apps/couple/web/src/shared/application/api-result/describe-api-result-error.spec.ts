import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { createInstance, type TFunction } from 'i18next';
import { describeApiResultError } from './describe-api-result-error';

const NAMESPACE = 'screen';

async function aTranslation(): Promise<TFunction> {
    const instance = createInstance();
    await instance.init({
        lng: 'fr',
        ns: [NAMESPACE],
        defaultNS: NAMESPACE,
        resources: {
            fr: {
                [NAMESPACE]: {
                    apiErrors: {
                        AUTHENTICATION_CREDENTIALS_INVALID:
                            'Adresse e-mail ou mot de passe incorrect.',
                        NETWORK_ERROR: 'Cocooning ne répond pas.',
                    },
                },
            },
        },
    });
    return instance.getFixedT('fr', NAMESPACE);
}

function anError(overrides: Partial<ApiError>): ApiError {
    return {
        code: ApiErrorCodeEnum.UNAUTHORIZED,
        message: 'Invalid credentials',
        backendCode: null,
        ...overrides,
    };
}

describe('Feature: describing a server error', () => {
    describe('Scenario: the backend code has its message', () => {
        it('translates the backend code', async () => {
            const t = await aTranslation();

            expect(
                describeApiResultError(
                    anError({
                        backendCode: 'AUTHENTICATION_CREDENTIALS_INVALID',
                    }),
                    t,
                ),
            ).toBe('Adresse e-mail ou mot de passe incorrect.');
        });
    });

    describe('Scenario: no backend code', () => {
        it('translates the kind of failure', async () => {
            const t = await aTranslation();

            expect(
                describeApiResultError(
                    anError({ code: ApiErrorCodeEnum.NETWORK_ERROR }),
                    t,
                ),
            ).toBe('Cocooning ne répond pas.');
        });
    });

    describe('Scenario: a backend code without message', () => {
        it('falls back to the kind of failure', async () => {
            const t = await aTranslation();

            expect(
                describeApiResultError(
                    anError({
                        code: ApiErrorCodeEnum.NETWORK_ERROR,
                        backendCode: 'PAIRING_COUPLE_NOT_FOUND',
                    }),
                    t,
                ),
            ).toBe('Cocooning ne répond pas.');
        });
    });

    describe('Scenario: nothing is translated', () => {
        it('shows the message of the API', async () => {
            const t = await aTranslation();

            expect(describeApiResultError(anError({}), t)).toBe(
                'Invalid credentials',
            );
        });
    });
});
