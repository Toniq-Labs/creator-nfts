export enum StaticLocalStorageKey {
    lastManuallyChosenTheme = 'lastManuallyChosenTheme',
    // this is stored by the stoic identity package
    stoicIdentity = '_scApp',
}

export type LocalStorageKey = StaticLocalStorageKey | PostIdLocalStorageKey;

export type PostIdLocalStorageKey = `tcnft-post-${string}`;

export function createPostIdLocalStorageKey(postId: string): PostIdLocalStorageKey {
    return `tcnft-post-${postId}`;
}
