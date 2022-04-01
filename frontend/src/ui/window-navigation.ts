const navigationPrevented: Record<string, boolean> = {};

export function preventNavigation(id: string) {
    navigationPrevented[id] = true;
    /**
     * For some reason setting this property is very unreliable (at least in Safari). Setting it
     * multiple times like this helps with that.
     */
    window.onbeforeunload = () => true;
    window.onbeforeunload = () => true;
    window.onbeforeunload = () => true;
    window.onbeforeunload = () => true;
    window.onbeforeunload = () => true;
    setTimeout(() => {
        window.onbeforeunload = () => true;
        window.onbeforeunload = () => true;
        window.onbeforeunload = () => true;
        window.onbeforeunload = () => true;
        window.onbeforeunload = () => true;
    });
}

export function enableNavigation(id: string) {
    navigationPrevented[id] = false;

    const stillContainsBlockedNavigation: boolean = Object.values(navigationPrevented).some(
        (value) => {
            return value;
        },
    );

    // if any keys are still set to true, don't enable navigation again.
    if (stillContainsBlockedNavigation) {
        return;
    }
    /**
     * For some reason setting this property is very unreliable (at least in Safari). Setting it
     * multiple times like this helps with that.
     */
    window.onbeforeunload = null;
    window.onbeforeunload = null;
    window.onbeforeunload = null;
    window.onbeforeunload = null;
    window.onbeforeunload = null;
    setTimeout(() => {
        window.onbeforeunload = null;
        window.onbeforeunload = null;
        window.onbeforeunload = null;
        window.onbeforeunload = null;
        window.onbeforeunload = null;
    });
}
