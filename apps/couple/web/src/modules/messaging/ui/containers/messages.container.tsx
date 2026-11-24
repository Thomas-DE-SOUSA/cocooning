'use client';

import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import { useMessagesRefresh } from '../../hooks/use-messages-refresh';
import {
    type MessagesScreenViewModel,
    MessagesStepEnum,
} from '../../view-models/message-feed.view-model';
import { MessagesScreenContainer } from './messages-screen.container';

export function MessagesContainer({
    viewModel,
}: {
    readonly viewModel: MessagesScreenViewModel;
}) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const refresh = useMessagesRefresh();
    if (viewModel.step === MessagesStepEnum.FEED) {
        return <MessagesScreenContainer viewModel={viewModel} />;
    }
    return (
        <UnavailableNotice
            title={t('unavailable.title')}
            description={describeApiResultError(viewModel.error, t)}
            retryLabel={t('unavailable.refresh')}
            onRetry={refresh}
        />
    );
}
