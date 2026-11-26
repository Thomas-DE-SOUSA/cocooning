import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import type { Namespace } from '@/i18n/resources';

// A page of the notes or the lists that could not be read: why, and a way to read it again (decision 0036).
export function useUnavailableNote(error: ApiError, namespace: Namespace) {
    const { t } = useTranslation(namespace);
    const router = useRouter();
    return {
        title: t('unavailable.title'),
        description: describeApiResultError(error, t),
        retryLabel: t('unavailable.refresh'),
        retry: () => router.refresh(),
    };
}
