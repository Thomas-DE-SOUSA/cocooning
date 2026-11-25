import {
    type AppWindow,
    type AppWindows,
    openAppAt,
} from './sw-notification-click';

class FakeAppWindow implements AppWindow {
    constructor(
        readonly name: string,
        readonly focused: boolean,
        private readonly journal: string[],
    ) {}

    focus(): Promise<AppWindow> {
        this.journal.push(`focus:${this.name}`);
        return Promise.resolve(this);
    }

    navigate(url: string): Promise<AppWindow | null> {
        this.journal.push(`navigate:${this.name}:${url}`);
        return Promise.resolve(this);
    }
}

class FakeAppWindows implements AppWindows {
    readonly journal: string[] = [];
    private readonly windows: FakeAppWindow[] = [];

    givenWindow(name: string, focused: boolean): void {
        this.windows.push(new FakeAppWindow(name, focused, this.journal));
    }

    matchAll(): Promise<readonly AppWindow[]> {
        return Promise.resolve([...this.windows]);
    }

    openWindow(url: string): Promise<unknown> {
        this.journal.push(`open:${url}`);
        return Promise.resolve(null);
    }
}

describe('Feature: a tap on a notification brings the app forward', () => {
    it('opens the app on the screen when no window is open', async () => {
        const windows = new FakeAppWindows();

        await openAppAt(windows, '/messages');

        expect(windows.journal).toEqual(['open:/messages']);
    });

    it('reuses the focused window of the app and takes it to the screen', async () => {
        const windows = new FakeAppWindows();
        windows.givenWindow('background', false);
        windows.givenWindow('front', true);

        await openAppAt(windows, '/agenda');

        expect(windows.journal).toEqual([
            'focus:front',
            'navigate:front:/agenda',
        ]);
    });

    it('reuses the first window when none is focused', async () => {
        const windows = new FakeAppWindows();
        windows.givenWindow('first', false);
        windows.givenWindow('second', false);

        await openAppAt(windows, '/');

        expect(windows.journal).toEqual(['focus:first', 'navigate:first:/']);
    });
});
