import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import { I18N_CONFIG } from '@/i18n/config';
import type { CoupleOverviewPage } from '../view-models/couple-overview.view-model';
import { resolveHomeDestination } from './home-destination.presenter';

const FORMED_AT_FORMAT = new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
    dateStyle: 'long',
    timeZone: I18N_CONFIG.timeZone,
});

// The couple is formed when its last partner joins: the latest joinedAt.
export function presentCoupleOverviewPage(
    couple: Result<CoupleResponse | null, ApiError>,
): CoupleOverviewPage {
    const destination = resolveHomeDestination(couple);
    if (destination !== null)
        return { redirectTo: destination, viewModel: null };
    if (!couple.success || couple.value === null) {
        return { redirectTo: WebRouterEnum.COUPLE_PAIRING, viewModel: null };
    }
    const formedAt = Math.max(
        ...couple.value.partners.map(({ joinedAt }) => Date.parse(joinedAt)),
    );
    return {
        redirectTo: null,
        viewModel: { formedAt: FORMED_AT_FORMAT.format(formedAt) },
    };
}
