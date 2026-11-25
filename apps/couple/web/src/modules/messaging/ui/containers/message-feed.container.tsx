'use client';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import { Drawer, toast } from '@cocooning/design-system';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import { messageCommandGateway, olderMessagesGateway } from '../../gateways';
import { useMessageCommands } from '../../hooks/use-message-commands';
import { useMessageFeedback } from '../../hooks/use-message-feedback';
import { useOlderMessages } from '../../hooks/use-older-messages';
import { useScrollToLatest } from '../../hooks/use-scroll-to-latest';
import { useWithdrawSheet } from '../../hooks/use-withdraw-sheet';
import { presentMessageFeedDays } from '../../presenters/message-feed.presenter';
import { MessageCommandEnum } from '../../view-models/message-command.view-model';
import { MessageFeedView } from '../views/message-feed.view';
import { WithdrawSheetView } from '../views/withdraw-sheet.view';

type Props = {
    readonly firstPage: MessageFeedPageResponse;
    readonly today: string;
};

// R5, R6: the first page read by the server, the older pages read here, and the withdrawal of my own items.
export function MessageFeedContainer({ firstPage, today }: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const reportOlderFailure = useCallback(
        (error: ApiError) =>
            toast.error(t('toast.olderFailed'), {
                description: describeApiResultError(error, t),
            }),
        [t],
    );
    const older = useOlderMessages(
        olderMessagesGateway,
        firstPage.nextCursor,
        reportOlderFailure,
    );
    const sheet = useWithdrawSheet();
    const { entry, close } = sheet;
    const { forget } = older;
    const settle = useCallback(() => {
        close();
        if (entry !== null) forget(entry.id);
    }, [close, entry, forget]);
    const commands = useMessageCommands({
        gateway: messageCommandGateway,
        ...useMessageFeedback(settle),
    });
    const days = useMemo(
        () =>
            presentMessageFeedDays([...firstPage.items, ...older.items], today),
        [firstPage.items, older.items, today],
    );
    const latestRef = useRef<HTMLDivElement | null>(null);
    useScrollToLatest(latestRef, days.at(-1)?.entries.at(-1)?.id ?? null);
    return (
        <>
            <MessageFeedView
                days={days}
                hasOlder={older.hasOlder}
                isLoadingOlder={older.isLoading}
                onLoadOlder={older.loadOlder}
                onSelectEntry={sheet.open}
                latestRef={latestRef}
            />
            <Drawer
                open={sheet.isOpen}
                onOpenChange={(open) => {
                    if (!open) close();
                }}
            >
                {entry === null ? null : (
                    <WithdrawSheetView
                        isWithdrawing={
                            commands.pending === MessageCommandEnum.WITHDRAW
                        }
                        isBusy={commands.isBusy}
                        onWithdraw={() => commands.withdraw(entry)}
                        onKeep={close}
                    />
                )}
            </Drawer>
        </>
    );
}
