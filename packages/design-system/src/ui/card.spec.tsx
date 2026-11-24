import { render, screen } from '@testing-library/react';
import { Card } from './card';

describe('Feature: a card', () => {
    it('shows its content on the surface color and keeps the extra classes', () => {
        render(<Card className="gap-2">Courses</Card>);

        const card = screen.getByText('Courses');
        expect(card.getAttribute('data-slot')).toBe('card');
        expect(card.className).toContain('bg-card');
        expect(card.className).toContain('gap-2');
    });
});
