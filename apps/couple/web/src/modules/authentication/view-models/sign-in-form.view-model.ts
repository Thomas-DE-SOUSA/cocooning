import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';

export type SignInFormViewModel = {
    readonly isPending: boolean;
    readonly onSubmit: (form: SignInForm) => void;
};
