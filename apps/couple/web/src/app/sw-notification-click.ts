export type AppWindow = {
    readonly focused: boolean;
    focus(): Promise<AppWindow>;
    navigate(url: string): Promise<AppWindow | null>;
};

export type AppWindows = {
    matchAll(options: {
        type: 'window';
        includeUncontrolled: false;
    }): Promise<readonly AppWindow[]>;
    openWindow(url: string): Promise<unknown>;
};

// A tap on a notification brings the app forward on its screen: an open window of the app is reused (its page is read
// again by the navigation, decision 0036), otherwise a new one opens.
export async function openAppAt(
    windows: AppWindows,
    url: string,
): Promise<void> {
    const open = await windows.matchAll({
        type: 'window',
        includeUncontrolled: false,
    });
    const target = open.find((window) => window.focused) ?? open[0];
    if (target === undefined) {
        await windows.openWindow(url);
        return;
    }
    const focused = await target.focus();
    await focused.navigate(url);
}
