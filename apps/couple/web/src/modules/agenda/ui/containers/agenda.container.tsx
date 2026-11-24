'use client';

import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import { useAgendaRefresh } from '../../hooks/use-agenda-refresh';
import {
    type AgendaScreenViewModel,
    AgendaStepEnum,
} from '../../view-models/agenda-screen.view-model';
import { AgendaHeaderView } from '../views/agenda-header.view';
import { AgendaCalendarContainer } from './agenda-calendar.container';

export function AgendaContainer({
    viewModel,
}: {
    readonly viewModel: AgendaScreenViewModel;
}) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const refresh = useAgendaRefresh();
    if (viewModel.step === AgendaStepEnum.CALENDAR) {
        return <AgendaCalendarContainer viewModel={viewModel} />;
    }
    return (
        <>
            <AgendaHeaderView onShowToday={null} />
            <UnavailableNotice
                title={t('unavailable.title')}
                description={describeApiResultError(viewModel.error, t)}
                retryLabel={t('unavailable.refresh')}
                onRetry={refresh}
            />
        </>
    );
}
