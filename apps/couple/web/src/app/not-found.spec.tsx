import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('Feature: unknown page', () => {
    it('says the page does not exist and links back home', async () => {
        render(await NotFound());

        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
            'Page introuvable',
        );
        expect(
            screen
                .getByRole('link', { name: "Revenir à l'accueil" })
                .getAttribute('href'),
        ).toBe('/');
    });
});
