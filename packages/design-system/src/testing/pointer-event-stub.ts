// jsdom has no PointerEvent; without it a fired pointer event loses its coordinates and the swipe row never moves.
class PointerEventStub extends MouseEvent {
    readonly pointerId: number;

    constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
    }
}

globalThis.PointerEvent = PointerEventStub as typeof PointerEvent;
