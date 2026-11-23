import {
    createSignInFormSchema,
    type SignInForm,
} from '@cocooning/couple-client-business-logic/authentication';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SIGN_IN_NAMESPACE } from '../data/authentication-i18n-namespaces';

const EMPTY_FORM: SignInForm = { emailAddress: '', password: '' };

export function useSignInForm(): UseFormReturn<SignInForm> {
    const { t } = useTranslation(SIGN_IN_NAMESPACE);
    const schema = useMemo(() => createSignInFormSchema(t), [t]);
    return useForm<SignInForm>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_FORM,
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
}
