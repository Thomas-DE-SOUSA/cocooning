import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('Feature: home page', () => {
    it('welcomes the couple in French', async () => {
        render(await HomePage());

        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
            'Bienvenue sur Cocooning',
        );
    });
});
