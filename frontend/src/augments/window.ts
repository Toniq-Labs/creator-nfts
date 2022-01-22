export function preventNavigation() {
    window.onbeforeunload = () => true;
}

export function enableNavigation() {
    window.onbeforeunload = null;
}
