import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { NOTE_NAMESPACE } from '../data/note-page-i18n-namespaces';

// The page of a note that could not be read: why, and a way to read it again (decision 0036).
export function useUnavailableNote(error: ApiError) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    const router = useRouter();
    return {
        title: t('unavailable.title'),
        description: describeApiResultError(error, t),
        retryLabel: t('unavailable.refresh'),
        retry: () => router.refresh(),
    };
}
