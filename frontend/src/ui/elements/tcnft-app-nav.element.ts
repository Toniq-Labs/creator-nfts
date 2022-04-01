import {isNftUserLoaded, MaybeNotLoadedUserId} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    defaultLoggedInHaveNftsRoute,
    defaultLoggedInNoNftsRoute,
    defaultNotLoggedInRoute,
    TcnftAppRouteListener,
    tcnftAppRouter,
} from '@frontend/src/ui/routes/app-router';
import {TcnftAppFullRoute} from '@frontend/src/ui/routes/app-routes';
import {css, defineElementEvent, html, onDomCreated} from 'element-vir';
import {areRoutesEqual} from 'spa-router-vir';

export const TcnftAppNav = defineCreatorNftElement({
    tagName: 'tcnft-app-nav',
    styles: css`
        :host {
            /*
                This app doesn't have an app-wide nav bar, so this just handles the router and
                should be hidden.
            */
            display: none;
        }
    `,
    props: {
        router: tcnftAppRouter,
        routeListener: undefined as TcnftAppRouteListener | undefined,
        currentFullRoute: undefined as {route: TcnftAppFullRoute; replace?: boolean} | undefined,
        currentUser: undefined as MaybeNotLoadedUserId | undefined,
        domCreated: false,
    },
    events: {
        routeChanged: defineElementEvent<TcnftAppFullRoute>(),
    },
    renderCallback: ({props, dispatch, events}) => {
        // respond to external route setting
        if (
            props.currentFullRoute &&
            !areRoutesEqual(props.currentFullRoute.route, props.router.getCurrentRawRoutes())
        ) {
            props.router.setRoutes(props.currentFullRoute.route, props.currentFullRoute.replace);
        }

        // if no user is signed in, kick them to the about page
        if (
            !props.currentUser &&
            !areRoutesEqual(props.router.getCurrentRawRoutes(), defaultNotLoggedInRoute)
        ) {
            props.router.setRoutes(defaultNotLoggedInRoute, true);
        }

        // if a user is signed in and there are no current routes, kick them to the default one
        if (
            isNftUserLoaded(props.currentUser) &&
            // wait for routing to finish loading first
            props.currentFullRoute &&
            // when we're on the default "/" path
            !props.currentFullRoute.route?.paths.length
        ) {
            const newRoute = props.currentUser.nftIdList.length
                ? defaultLoggedInHaveNftsRoute
                : defaultLoggedInNoNftsRoute;

            props.router.setRoutes(
                {
                    ...props.currentFullRoute?.route,
                    ...newRoute,
                },
                true,
            );
        }

        if (
            // wait till the dom is created so we know that we have a parent setup to emit events to
            props.domCreated
        ) {
            if (!props.routeListener) {
                // attach a route listener
                props.routeListener = props.router.addRouteListener(true, (fullRoute) => {
                    props.currentFullRoute = {route: fullRoute};
                    dispatch(new events.routeChanged(fullRoute));
                });
            }
        }

        return html`
            <div
                ${onDomCreated(() => {
                    props.domCreated = true;
                })}
            ></div>
        `;
    },
});
