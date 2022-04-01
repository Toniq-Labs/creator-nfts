import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {tcnftAppRouter} from '@frontend/src/ui/routes/app-router';
import {TcnftAppFullRoute} from '@frontend/src/ui/routes/app-routes';
import {css, html} from 'element-vir';
import {shouldMouseEventTriggerRoutes, SpaRouter} from 'spa-router-vir';
import {TriggerTcnftAppRouteChangeEvent} from '../../global-events/trigger-tcnft-app-route-change.event';

/**
 * Wraps an <a> element for an a11y link but prevents page redirection when a simple click is fired,
 * instead emitting a route change event. In other cases, however, the <a> click is not intercepted,
 * so right clicks work and "open in new tab" works and cmd / ctrl+click still opens the link in a
 * new tab without routing the original page.
 */
export const RouteLink = defineCreatorNftElement({
    tagName: 'tcnft-route-link',
    props: {
        routeLink: undefined as Partial<TcnftAppFullRoute> | undefined,
        router: tcnftAppRouter as Readonly<SpaRouter<any, any, any>>,
        isAnchorFocusable: false,
    },
    styles: css`
        a:focus {
            outline: none;
        }

        :host(.tcnft-route-link-no-underline) a {
            text-decoration: none;
        }
    `,
    renderCallback: ({props, host, genericDispatch}) => {
        if (props.routeLink) {
            const linkUrl = props.router.createRoutesUrl({
                ...props.router.getCurrentRawRoutes(),
                ...props.routeLink,
            });

            return html`
                <a
                    href=${linkUrl}
                    @click=${(clickEvent: MouseEvent) => {
                        if (shouldMouseEventTriggerRoutes(clickEvent)) {
                            clickEvent.preventDefault();
                            genericDispatch(
                                new TriggerTcnftAppRouteChangeEvent(props.routeLink ?? {}),
                            );
                        }
                    }}
                    tabindex=${props.isAnchorFocusable ? '0' : '-1'}
                >
                    <slot></slot>
                </a>
            `;
        } else {
            console.error(host);
            console.error(`no route link provided for ${RouteLink.tagName}`);
            return html``;
        }
    },
});
