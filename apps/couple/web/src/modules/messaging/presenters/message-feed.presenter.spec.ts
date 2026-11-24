import {
    A_FLASH_MESSAGE,
    A_HIDDEN_PHOTO_OF_THE_DAY,
    AN_INSTANT_PHOTO,
} from '@cocooning/couple-client-business-logic/testing';
import {
    FeedDayKindEnum,
    MessageFeedEntryKindEnum,
} from '../view-models/message-feed.view-model';
import { aPhotoOfTheDay, aWord } from './__tests__/feed-items';
import {
    presentMessageFeedDays,
    toMessageFeedEntry,
} from './message-feed.presenter';

const TODAY = '2026-11-24';

describe('Feature: the feed of the couple (R5)', () => {
    describe('Scenario: each item as the feed shows it', () => {
        it('gives a word its text, its author side and its Paris time', () => {
            expect(toMessageFeedEntry(A_FLASH_MESSAGE)).toEqual({
                kind: MessageFeedEntryKindEnum.FLASH_MESSAGE,
                id: A_FLASH_MESSAGE.id,
                isOwner: true,
                time: '19:00',
                text: 'Je t aime',
            });
        });

        it('points a visible photo to the photo route of the PWA', () => {
            expect(toMessageFeedEntry(AN_INSTANT_PHOTO)).toEqual({
                kind: MessageFeedEntryKindEnum.INSTANT_PHOTO,
                id: AN_INSTANT_PHOTO.id,
                isOwner: true,
                time: '19:05',
                src: `/api/instant-photos/${AN_INSTANT_PHOTO.id}`,
                isPhotoOfTheDay: false,
                isLate: false,
            });
        });

        it('R8, tells a photo of the day sent late', () => {
            expect(
                toMessageFeedEntry(
                    aPhotoOfTheDay(
                        'photo-late',
                        '2026-11-24T13:40:00.000Z',
                        true,
                    ),
                ),
            ).toMatchObject({
                isPhotoOfTheDay: true,
                isLate: true,
                time: '14:40',
            });
        });

        it('R9, gives a hidden photo of the day no address at all', () => {
            const entry = toMessageFeedEntry(A_HIDDEN_PHOTO_OF_THE_DAY);

            expect(entry).toEqual({
                kind: MessageFeedEntryKindEnum.HIDDEN_PHOTO,
                id: A_HIDDEN_PHOTO_OF_THE_DAY.id,
                isOwner: false,
                time: '15:02',
            });
        });
    });

    describe('Scenario: the items grouped by Paris day, newest first', () => {
        const days = presentMessageFeedDays(
            [
                aWord('w1', '2026-11-24T17:00:00.000Z', true),
                aWord('w2', '2026-11-23T23:30:00.000Z', false),
                aWord('w3', '2026-11-23T08:00:00.000Z', true),
                aWord('w4', '2026-11-20T08:00:00.000Z', false),
                aWord('w5', '2025-12-31T08:00:00.000Z', false),
            ],
            TODAY,
        );

        it('opens with today, then yesterday, then the date, with the year of another year', () => {
            expect(days.map(({ day, heading }) => [day, heading])).toEqual([
                ['2026-11-24', { kind: FeedDayKindEnum.TODAY }],
                ['2026-11-23', { kind: FeedDayKindEnum.YESTERDAY }],
                [
                    '2026-11-20',
                    {
                        kind: FeedDayKindEnum.DATE,
                        label: 'Vendredi 20 novembre',
                    },
                ],
                [
                    '2025-12-31',
                    {
                        kind: FeedDayKindEnum.DATE,
                        label: 'Mercredi 31 décembre 2025',
                    },
                ],
            ]);
        });

        it('counts a word sent at 00:30 in Paris on its Paris day, in the order received', () => {
            expect(days[0]?.entries.map(({ id, time }) => [id, time])).toEqual([
                ['w1', '18:00'],
                ['w2', '00:30'],
            ]);
        });

        it('shows an item once when two pages both hold it', () => {
            const word = aWord('w1', '2026-11-24T17:00:00.000Z', true);

            expect(
                presentMessageFeedDays([word, word], TODAY)[0]?.entries,
            ).toHaveLength(1);
        });

        it('has no day when the feed is empty', () => {
            expect(presentMessageFeedDays([], TODAY)).toEqual([]);
        });
    });
});
