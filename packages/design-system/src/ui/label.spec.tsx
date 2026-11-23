import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Feature: a field label', () => {
    it('shows its text and keeps the extra classes', () => {
        render(<Label className="sr-only">Mot de passe</Label>);

        const label = screen.getByText('Mot de passe');
        expect(label.getAttribute('data-slot')).toBe('label');
        expect(label.className).toContain('sr-only');
    });
});
