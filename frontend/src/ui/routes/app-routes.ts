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
          // content id
          string,
      ];

export type ValidTcnftSearch = Partial<Record<TcnftAppSearchParamKeys, string>> | undefined;

export enum TcnftAppTopLevelRoute {
    About = 'about',
    Home = 'home',
}

/**
 * These "routes" are actually search params so that their actions can take place without rerouting
 * the page. Meaning, these actions take place in ADDITION to the current route. For example, you
 * can be viewing content on the home page and also mint and the minting action will take place on
 * top of the current route (as a modal). This makes it super easy for the user to simply return
 * back to what they were viewing previously.
 */
export enum TcnftAppSearchParamKeys {
    Mint = 'mint',
    MintUrl = 'mint-url',
    MintFlair = 'mint-flair',

    BrowseNftPage = 'browse-nft',
}

export type TcnftAppFullRoute = Required<
    Readonly<FullRoute<ValidTcnftRoutes, ValidTcnftSearch, undefined>>
>;
