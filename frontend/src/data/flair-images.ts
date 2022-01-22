import {getEnumTypedValues} from 'augment-vir/dist/web-index';

const baseUrl = '/flairs/';

export enum FlairKey {
    Laugh = 'laugh',
    Oooo = 'oooo',
    Party = 'party',
    Surprised = 'surprised',
    None = 'none',
}

const flairImages: Record<FlairKey, {fileName: string | undefined; label: string}> = {
    [FlairKey.Laugh]: {
        fileName: 'laugh.png',
        label: 'Laugh',
    },
    [FlairKey.Oooo]: {
        fileName: 'oooo.png',
        label: 'Oooo',
    },
    [FlairKey.Party]: {
        fileName: 'party.png',
        label: 'Party',
    },
    [FlairKey.Surprised]: {
        fileName: 'surprised.png',
        label: 'Surprised',
    },
    [FlairKey.None]: {
        fileName: undefined,
        label: 'None',
    },
};

export const allFlairKeys: FlairKey[] = [
    FlairKey.None,
    ...getEnumTypedValues(FlairKey)
        .filter((flairKey) => flairKey !== FlairKey.None)
        .sort(),
];

export function getFlairLabelAndUrl(flairKey: FlairKey): {
    url: string | undefined;
    label: string;
} {
    const flair = flairImages[flairKey];
    const fileName = flair.fileName;

    const url = fileName ? `${baseUrl}${flair.fileName}` : undefined;

    return {label: flair.label, url};
}
