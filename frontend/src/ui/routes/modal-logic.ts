import {
    TcnftAppFullRoute,
    TcnftAppSearchParamKeys,
    ValidTcnftSearch,
} from '@frontend/src/ui/routes/app-routes';
import {getObjectTypedKeys} from 'augment-vir';

export enum ModalName {
    Mint = 'mint',
    BrowseNft = 'browse-nft',
    EditJson = 'edit-json',
}

const modalRouteSearchKeys: Readonly<Record<ModalName, Readonly<TcnftAppSearchParamKeys[]>>> = {
    [ModalName.Mint]: [
        TcnftAppSearchParamKeys.Mint,
        TcnftAppSearchParamKeys.MintUrl,
        TcnftAppSearchParamKeys.MintFlair,
    ],
    [ModalName.BrowseNft]: [
        TcnftAppSearchParamKeys.BrowseNftPage,
        TcnftAppSearchParamKeys.BrowseNftSearch,
    ],
    [ModalName.EditJson]: [TcnftAppSearchParamKeys.EditJson],
} as const;

export function clearAllModalsFromRoute(
    currentRoute?: TcnftAppFullRoute,
): TcnftAppFullRoute | undefined {
    if (!currentRoute) {
        return undefined;
    }
    const overwriteSearch: NonNullable<ValidTcnftSearch> = getObjectTypedKeys(
        modalRouteSearchKeys,
    ).reduce((accum: NonNullable<ValidTcnftSearch>, modalName) => {
        modalRouteSearchKeys[modalName].forEach((searchKey) => {
            accum[searchKey] = undefined;
        });
        return accum;
    }, {});

    return {
        ...currentRoute,
        search: {...(currentRoute.search || {}), ...overwriteSearch},
    };
}

export function getCurrentModalKey(currentRoute?: TcnftAppFullRoute): undefined | ModalName {
    if (!currentRoute) {
        return undefined;
    }

    const currentModalName = getObjectTypedKeys(modalRouteSearchKeys).find((modalName) =>
        modalRouteSearchKeys[modalName].some(
            (searchKey) => currentRoute?.search?.[searchKey] != undefined,
        ),
    );

    if (!currentModalName) {
        return undefined;
    }

    return currentModalName;
}
