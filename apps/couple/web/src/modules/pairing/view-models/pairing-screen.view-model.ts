import type { ApiError } from '@cocooning/couple-client-business-logic/shared';

export const PairingStepEnum = {
    NO_COUPLE: 'NO_COUPLE',
    WAITING_FOR_PARTNER: 'WAITING_FOR_PARTNER',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type PairingScreenViewModel =
    | { readonly step: typeof PairingStepEnum.NO_COUPLE }
    | {
          readonly step: typeof PairingStepEnum.WAITING_FOR_PARTNER;
          readonly invitationCode: string;
          readonly expiresAt: string;
      }
    | {
          readonly step: typeof PairingStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type PairingPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | { readonly redirectTo: null; readonly viewModel: PairingScreenViewModel };

export const PairingCommandEnum = {
    CREATE_COUPLE: 'CREATE_COUPLE',
    JOIN_COUPLE: 'JOIN_COUPLE',
    RENEW_INVITATION_CODE: 'RENEW_INVITATION_CODE',
} as const;

export type PairingCommand =
    (typeof PairingCommandEnum)[keyof typeof PairingCommandEnum];
