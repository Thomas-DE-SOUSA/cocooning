import {
    createJoinCoupleFormSchema,
    type JoinCoupleForm,
} from '@cocooning/couple-client-business-logic/pairing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PAIRING_NAMESPACE } from '../data/pairing-i18n-namespaces';

const EMPTY_FORM: JoinCoupleForm = { invitationCode: '' };

export function useJoinCoupleForm(): UseFormReturn<JoinCoupleForm> {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    const schema = useMemo(() => createJoinCoupleFormSchema(t), [t]);
    return useForm<JoinCoupleForm>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_FORM,
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
}
