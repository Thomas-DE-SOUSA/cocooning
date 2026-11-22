const decorate = (): MethodDecorator => () => undefined;

class Sample {
    @decorate()
    public greet(name: string): string {
        return `hello ${name}`;
    }
}

describe('nest variant', () => {
    it('compiles decorators and jest globals', () => {
        expect(new Sample().greet('you')).toBe('hello you');
    });
});
