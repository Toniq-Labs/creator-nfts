/**
 * Cleans up a URL by removing query params, hash, protocol, etc. Will be used for determining price
 * increase for NFTs.
 */
// https://a:asdf@www.example.com:80/path/to/file.php?asdf=123#hash=456
export function standardizeUrl(originalUrl: string): string {
    // Add protocol if needed, in order to parse with URL()
    const originalWithProtocol = /^https?:\/\//i.test(originalUrl)
        ? originalUrl
        : `http://${originalUrl}`;
    const url = new URL(originalWithProtocol);

    const originalHash = url.hash.trim();
    const hash = originalHash.length > 1 ? originalHash : '';
    const host = url.host.replace(/:(80|443)$/, '');
    const pathname = hash ? url.pathname : url.pathname.replace(/\/$/, '');

    return `${host}${pathname}${hash}`.trim();
}
