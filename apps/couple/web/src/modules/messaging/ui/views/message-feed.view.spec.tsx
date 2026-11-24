import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import {
    FeedDayKindEnum,
    type MessageFeedDay,
    MessageFeedEntryKindEnum,
} from '../../view-models/message-feed.view-model';
import { MessageFeedView } from './message-feed.view';

const TODAY: MessageFeedDay = {
    day: '2026-11-24',
    heading: { kind: FeedDayKindEnum.TODAY },
    entries: [
        {
            kind: MessageFeedEntryKindEnum.FLASH_MESSAGE,
            id: 'word-mine',
            isOwner: true,
            time: '18:22',
            text: "Je t'aime",
        },
        {
            kind: MessageFeedEntryKindEnum.INSTANT_PHOTO,
            id: 'photo-mine',
            isOwner: true,
            time: '14:40',
            src: '/api/instant-photos/photo-mine',
            isPhotoOfTheDay: true,
            isLate: true,
        },
        {
            kind: MessageFeedEntryKindEnum.HIDDEN_PHOTO,
            id: 'photo-hidden',
            isOwner: false,
            time: '14:35',
        },
        {
            kind: MessageFeedEntryKindEnum.FLASH_MESSAGE,
            id: 'word-partner',
            isOwner: false,
            time: '12:04',
            text: 'Tu me manques',
        },
    ],
};
const EARLIER: MessageFeedDay = {
    day: '2026-11-20',
    heading: { kind: FeedDayKindEnum.DATE, label: 'Vendredi 20 novembre' },
    entries: [],
};

function renderFeed(
    days: readonly MessageFeedDay[],
    older = { hasOlder: false, isLoadingOlder: false },
) {
    const events: string[] = [];
    render(
        <WithI18n>
            <MessageFeedView
                days={days}
                {...older}
                onLoadOlder={() => events.push('older')}
                onSelectEntry={(entry) => events.push(entry.id)}
            />
        </WithI18n>,
    );
    return { events };
}

describe('Feature: the feed of the messages screen (R5)', () => {
    it('heads each Paris day, today then the date', () => {
        renderFeed([TODAY, EARLIER]);

        expect(
            screen
                .getAllByRole('heading')
                .map((heading) => heading.textContent),
        ).toEqual(["Aujourd'hui", 'Vendredi 20 novembre']);
    });

    it('shows each item with its Paris time, and a photo of the day sent late', () => {
        renderFeed([TODAY]);

        expect(screen.getByText('18:22')).toBeTruthy();
        expect(
            screen.getByText('14:40, photo du jour, en retard'),
        ).toBeTruthy();
        expect(
            screen.getByRole('img', { name: 'Ma photo' }).getAttribute('src'),
        ).toBe('/api/instant-photos/photo-mine');
    });

    it('R9, shows a lock instead of the hidden photo of the day, without asking for it', () => {
        renderFeed([TODAY]);

        expect(
            screen.getByText('Envoie la tienne pour voir la sienne'),
        ).toBeTruthy();
        expect(screen.getAllByRole('img')).toHaveLength(1);
    });

    it("R6, opens only my own items, never the partner's", () => {
        const { events } = renderFeed([TODAY]);

        fireEvent.click(
            screen.getByRole('button', { name: "Je t'aime Retirer" }),
        );
        fireEvent.click(screen.getByText('Tu me manques'));

        expect(events).toEqual(['word-mine']);
        expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('reads older messages on demand, and spins while they load', () => {
        const { events } = renderFeed([TODAY], {
            hasOlder: true,
            isLoadingOlder: false,
        });

        fireEvent.click(
            screen.getByRole('button', { name: 'Voir les plus anciens' }),
        );

        expect(events).toEqual(['older']);
    });

    it('says when the feed is still empty', () => {
        renderFeed([]);

        expect(
            screen.getByText(
                "Pas encore de mot ni de photo. À toi d'envoyer le premier !",
            ),
        ).toBeTruthy();
    });
});
