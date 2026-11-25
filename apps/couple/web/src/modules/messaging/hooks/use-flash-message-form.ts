import {
    createFlashMessageFormSchema,
    type FlashMessageForm,
} from '@cocooning/couple-client-business-logic/messaging';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../data/messaging-i18n-namespaces';
import type { FlashMessageFormInput } from '../view-models/flash-message-form.view-model';

const EMPTY_WORD: FlashMessageFormInput = { text: '' };

// R2: the typed word, trimmed, 1 to 140 signs; the errors show under the field (decision 0035).
export function useFlashMessageForm() {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const schema = useMemo(() => createFlashMessageFormSchema(t), [t]);
    return useForm<FlashMessageFormInput, unknown, FlashMessageForm>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_WORD,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
