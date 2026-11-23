import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';

export type PairingCommandCall =
    | { readonly operation: 'createCouple' | 'renewInvitationCode' }
    | { readonly operation: 'joinCouple'; readonly form: JoinCoupleForm };
