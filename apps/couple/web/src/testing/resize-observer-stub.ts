// jsdom has no ResizeObserver; Radix measures the switch with it when the switch sits in a form.
class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverStub;
