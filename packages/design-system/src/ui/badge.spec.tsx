import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Feature: a badge', () => {
    describe('Scenario: no variant given', () => {
        it('uses the secondary colors', () => {
            render(<Badge>Partagée</Badge>);

            expect(screen.getByText('Partagée').className).toContain(
                'bg-secondary',
            );
        });
    });

    describe('Scenario: an outline badge', () => {
        it('draws a border instead of a fill and keeps the extra classes', () => {
            render(
                <Badge
                    variant="outline"
                    className="ml-auto"
                >
                    Privée
                </Badge>,
            );

            const badge = screen.getByText('Privée');
            expect(badge.className).toContain('border-input');
            expect(badge.className).toContain('ml-auto');
        });
    });
});
