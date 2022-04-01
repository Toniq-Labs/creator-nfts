import {
    getWindowTitle,
    TcnftAppFullRoute,
    TcnftAppSearchParamKeys,
    TcnftAppTopLevelRoute,
    ValidTcnftRoutes,
    ValidTcnftSearch,
} from '@frontend/src/ui/routes/app-routes';
import {isEnumValue} from 'augment-vir';
import {createSpaRouter, RouteListener} from 'spa-router-vir';

/**
 * This is the default logged in route. If the user is not logged in, this will get redirected to
 * the About route. However, this redirection does not occur in the router because the router is
 * agnostic of user data.
 */
export const defaultLoggedInNoNftsRoute: Pick<TcnftAppFullRoute, 'paths'> = {
    paths: [TcnftAppTopLevelRoute.About],
};

export const defaultLoggedInHaveNftsRoute: Pick<TcnftAppFullRoute, 'paths'> = {
    paths: [TcnftAppTopLevelRoute.Home],
};

export const emptyRoute: TcnftAppFullRoute = {
    paths: [],
    hash: undefined,
    search: undefined,
};

export const defaultNotLoggedInRoute: Pick<TcnftAppFullRoute, 'paths'> = defaultLoggedInNoNftsRoute;

export type TcnftAppRouteListener = RouteListener<ValidTcnftRoutes, ValidTcnftSearch, undefined>;

export const tcnftAppRouter = createSpaRouter<ValidTcnftRoutes, ValidTcnftSearch, undefined>({
    routeSanitizer: (fullRoute) => {
        const sanitizedPaths: ValidTcnftRoutes = [] as ValidTcnftRoutes;
        if (fullRoute.paths.length) {
            // check main path
            if (isEnumValue(fullRoute.paths[0], TcnftAppTopLevelRoute)) {
                sanitizedPaths[0] = fullRoute.paths[0];
            }

            // check sub paths
            // sub paths are only allowed on the home page
            if (sanitizedPaths[0] === TcnftAppTopLevelRoute.Home) {
                // there are only two allowed sub paths so far (category id and content id)
                for (let pathIndex = 1; pathIndex <= 2; pathIndex++) {
                    const currentPath = fullRoute.paths[pathIndex];

                    if (currentPath) {
                        sanitizedPaths[pathIndex] = currentPath;
                    }
                }
            } else if (sanitizedPaths[0] === TcnftAppTopLevelRoute.Creator) {
                const currentlyEditingPost = fullRoute.paths[1];
                if (currentlyEditingPost) {
                    sanitizedPaths[1] = currentlyEditingPost;
                }
            }
        }

        // save off for better type checking
        const originalSearch = fullRoute.search;

        const searchKeys = originalSearch ? Object.keys(originalSearch) : [];

        const sanitizedSearch: ValidTcnftSearch = searchKeys.length ? {} : undefined;

        if (originalSearch && sanitizedSearch) {
            searchKeys.forEach((searchKey) => {
                if (isEnumValue(searchKey, TcnftAppSearchParamKeys)) {
                    const originalValue = originalSearch[searchKey];
                    // remove a search query if its value is falsy (undefined or empty string)
                    if (originalValue) {
                        sanitizedSearch[searchKey] = originalValue;
                    }
                }
            });
        }

        const sanitizedRoute = {paths: sanitizedPaths, search: sanitizedSearch, hash: undefined};

        const pageTitle = getWindowTitle(sanitizedRoute);
        if (pageTitle) {
            window.document.title = `Creator NFTs - ${pageTitle}`;
        }
        return sanitizedRoute;
    },
    maxListenerCount: 1,
});
