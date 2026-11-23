import { toast } from '@cocooning/design-system';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';

export const showError = (error: never, t: (key: string) => string) =>
    toast.error(t('toast.saveFailed'), {
        description: describeApiResultError(error, t),
    });
