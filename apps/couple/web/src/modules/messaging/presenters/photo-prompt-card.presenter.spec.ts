import { A_TODAY_PHOTO_PROMPT } from '@cocooning/couple-client-business-logic/testing';
import type { TodayPhotoPromptResponse } from '@cocooning/couple-contract/messaging';
import { PhotoPromptCardStatusEnum } from '../view-models/photo-prompt-card.view-model';
import { presentPhotoPromptCard } from './photo-prompt-card.presenter';

const PROMPT = A_TODAY_PHOTO_PROMPT.photoPrompt!;
const withPrompt = (
    changes: Partial<typeof PROMPT>,
): TodayPhotoPromptResponse => ({ photoPrompt: { ...PROMPT, ...changes } });

describe("Feature: the card of today's photo prompt (R7, R8, R9)", () => {
    it('shows no card before the prompt is issued', () => {
        expect(
            presentPhotoPromptCard({ photoPrompt: null }, new Date()),
        ).toBeNull();
    });

    it('invites me with the Paris time and the minutes left before "en retard"', () => {
        expect(
            presentPhotoPromptCard(
                A_TODAY_PHOTO_PROMPT,
                new Date('2026-11-24T14:03:30.000Z'),
            ),
        ).toEqual({
            status: PhotoPromptCardStatusEnum.OPEN,
            photoPromptId: PROMPT.id,
            issuedAt: '15:00',
            minutesBeforeLate: 7,
            isAnsweredByPartner: true,
        });
    });

    it('tells that my photo would come late after 10 minutes', () => {
        expect(
            presentPhotoPromptCard(
                withPrompt({ isAnsweredByPartner: false }),
                new Date('2026-11-24T14:10:00.000Z'),
            ),
        ).toMatchObject({
            minutesBeforeLate: null,
            isAnsweredByPartner: false,
        });
    });

    it('turns into a discreet line once I answered', () => {
        expect(
            presentPhotoPromptCard(
                withPrompt({ myInstantPhotoId: 'my-photo' }),
                new Date('2026-11-24T14:20:00.000Z'),
            ),
        ).toEqual({
            status: PhotoPromptCardStatusEnum.ANSWERED,
            isAnsweredByPartner: true,
        });
    });

    it('shows no card from midnight on, when the prompt is over', () => {
        expect(
            presentPhotoPromptCard(
                A_TODAY_PHOTO_PROMPT,
                new Date('2026-11-24T23:00:00.000Z'),
            ),
        ).toBeNull();
    });
});
