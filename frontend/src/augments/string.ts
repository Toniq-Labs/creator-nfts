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

    // If we have content sites that are legit www-only, reconsider this
    const host = url.host.replace(/^www\./i, '').replace(/:(80|443)$/, '');
    const pathname = url.pathname.replace(/\/$/, '');

    return `${host}${pathname}`.trim();
}
