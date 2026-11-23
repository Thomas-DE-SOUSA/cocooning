'use client';

import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import {
    Button,
    Field,
    FieldError,
    Input,
    Label,
    Spinner,
} from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SIGN_IN_NAMESPACE } from '../../data/authentication-i18n-namespaces';
import type { SignInFormViewModel } from '../../view-models/sign-in-form.view-model';

type Props = {
    readonly form: UseFormReturn<SignInForm>;
    readonly viewModel: SignInFormViewModel;
};

const EMAIL_ERROR_ID = 'sign-in-email-address-error';
const PASSWORD_ERROR_ID = 'sign-in-password-error';

// method="post": a submit before hydration must never put the password in the URL.
export function SignInFormView({
    form,
    viewModel: { isPending, onSubmit },
}: Props) {
    const { t } = useTranslation(SIGN_IN_NAMESPACE);
    const { errors } = form.formState;
    return (
        <form
            method="post"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-sm flex-col gap-4"
        >
            <Field>
                <Label htmlFor="emailAddress">
                    {t('form.emailAddress.label')}
                </Label>
                <Input
                    id="emailAddress"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-invalid={Boolean(errors.emailAddress)}
                    aria-describedby={EMAIL_ERROR_ID}
                    {...form.register('emailAddress')}
                />
                <FieldError id={EMAIL_ERROR_ID}>
                    {errors.emailAddress?.message}
                </FieldError>
            </Field>
            <Field>
                <Label htmlFor="password">{t('form.password.label')}</Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={PASSWORD_ERROR_ID}
                    {...form.register('password')}
                />
                <FieldError id={PASSWORD_ERROR_ID}>
                    {errors.password?.message}
                </FieldError>
            </Field>
            <Button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
            >
                {isPending ? (
                    <Spinner aria-label={t('submit.pending')} />
                ) : (
                    t('submit.label')
                )}
            </Button>
        </form>
    );
}
