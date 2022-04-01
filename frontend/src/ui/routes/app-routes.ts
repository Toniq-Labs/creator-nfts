import {FullRoute} from 'spa-router-vir';

export type ValidTcnftRoutes =
    | []
    | [TcnftAppTopLevelRoute]
    | [
          TcnftAppTopLevelRoute.Home,
          // category id
          string,
      ]
    | [
          TcnftAppTopLevelRoute.Home,
          // category id
          string,
          // post id
          string,
      ]
    | [
          TcnftAppTopLevelRoute.Creator,
          // post id
          string,
      ];

export type ValidTcnftSearch = Partial<Record<TcnftAppSearchParamKeys, string>> | undefined;

export enum TcnftAppTopLevelRoute {
    About = 'about',
    Home = 'home',
    Creator = 'creator',
}

export function getWindowTitle(route: TcnftAppFullRoute | undefined): string {
    if (!route) {
        return '';
    }

    if (route.search) {
        if (
            route.search[TcnftAppSearchParamKeys.Mint] ||
            route.search[TcnftAppSearchParamKeys.MintUrl] ||
            route.search[TcnftAppSearchParamKeys.MintFlair]
        ) {
            return 'Mint';
        }

        if (
            route.search[TcnftAppSearchParamKeys.BrowseNftSearch] ||
            route.search[TcnftAppSearchParamKeys.BrowseNftPage]
        ) {
            return 'My NFTs';
        }
    }

    if (route.paths.length) {
        switch (route.paths[0]) {
            case TcnftAppTopLevelRoute.About: {
                return 'About';
            }
            case TcnftAppTopLevelRoute.Home: {
                return 'Home';
            }
            case TcnftAppTopLevelRoute.Creator: {
                return 'Creator Dashboard';
            }
        }
    }

    return '';
}

/**
 * These "routes" are actually search params so that their actions can take place without rerouting
 * the page. Meaning, these actions take place in ADDITION to the current route. For example, you
 * can be viewing content on the home page and also mint and the minting action will take place on
 * top of the current route (as a modal). This makes it super easy for the user to simply return
 * back to what they were viewing previously.
 */
export enum TcnftAppSearchParamKeys {
    HomeSearch = 'search',
    HomeBrowsePage = 'page',

    Mint = 'mint',
    MintUrl = 'mint-url',
    MintFlair = 'mint-flair',

    BrowseNftSearch = 'nft-search',
    BrowseNftPage = 'nft-page',

    EditJson = 'edit-json',
}

export type TcnftAppFullRoute = Required<
    Readonly<FullRoute<ValidTcnftRoutes, ValidTcnftSearch, undefined>>
>;
