import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import {
    type PhotoPromptCard,
    PhotoPromptCardStatusEnum,
} from '../../view-models/photo-prompt-card.view-model';
import { PhotoPromptCardView } from './photo-prompt-card.view';

const OPEN: PhotoPromptCard = {
    status: PhotoPromptCardStatusEnum.OPEN,
    photoPromptId: 'prompt-1',
    issuedAt: '14:32',
    minutesBeforeLate: 7,
    isAnsweredByPartner: true,
};

function renderCard(card: PhotoPromptCard) {
    const taken: string[] = [];
    render(
        <WithI18n>
            <PhotoPromptCardView
                card={card}
                isBusy={false}
                onTakePhoto={(id) => taken.push(id)}
            />
        </WithI18n>,
    );
    return { taken };
}

describe("Feature: today's photo prompt (R8, R9)", () => {
    it('invites me with its time, the minutes left and my partner who already answered', () => {
        const { taken } = renderCard(OPEN);

        expect(
            screen.getByRole('heading', { name: "C'est l'heure de la photo" }),
        ).toBeTruthy();
        expect(screen.getByText('Invitation de 14:32')).toBeTruthy();
        expect(
            screen.getByText(
                "Encore 7 min avant « en retard ». Tu peux répondre jusqu'à minuit.",
            ),
        ).toBeTruthy();
        expect(
            screen.getByText(
                'Ton âme sœur a envoyé sa photo : envoie la tienne pour la voir.',
            ),
        ).toBeTruthy();
        fireEvent.click(
            screen.getByRole('button', { name: 'Prendre ma photo' }),
        );
        expect(taken).toEqual(['prompt-1']);
    });

    it('tells that my photo will come late, my partner still waiting', () => {
        renderCard({
            ...OPEN,
            minutesBeforeLate: null,
            isAnsweredByPartner: false,
        });

        expect(
            screen.getByText(
                "Elle portera « en retard ». Tu peux répondre jusqu'à minuit.",
            ),
        ).toBeTruthy();
        expect(
            screen.getByText("Ton âme sœur n'a pas encore envoyé la sienne."),
        ).toBeTruthy();
    });

    it('turns into a discreet line once both of us answered', () => {
        renderCard({
            status: PhotoPromptCardStatusEnum.ANSWERED,
            isAnsweredByPartner: true,
        });

        expect(
            screen.getByText("Photo du jour : vous l'avez prise tous les deux"),
        ).toBeTruthy();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
