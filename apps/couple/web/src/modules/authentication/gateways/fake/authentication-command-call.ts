import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';

export type AuthenticationCommandCall =
    | { readonly operation: 'signIn'; readonly form: SignInForm }
    | { readonly operation: 'signOut' };
