import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {emptyRoute, tcnftAppRouter} from '@frontend/src/ui/routes/app-router';
import {css, html} from 'element-vir';
import {FullRoute, routeOnLinkClick, SpaRouter} from 'spa-router-vir';

/**
 * Wraps an <a> element for an a11y link but prevents page redirection when a simple click is fired,
 * instead emitting a route change event. In other cases, however, the <a> click is not intercepted,
 * so right clicks work and "open in new tab" works and cmd / ctrl+click still opens the link in a
 * new tab without routing the original page.
 */
export const RouteLink = defineCreatorNftElement({
    tagName: 'tcnft-route-link',
    props: {
        routeLink: undefined as FullRoute | undefined,
        router: tcnftAppRouter as Readonly<SpaRouter<any, any, any>>,
        isAnchorFocusable: false,
    },
    styles: css`
        a {
        }

        a:focus {
            outline: none;
        }
    `,
    renderCallback: ({props}) => {
        const fullRoute: Readonly<FullRoute> = props.routeLink || emptyRoute;

        const linkUrl = props.router.createRoutesUrl(fullRoute);

        if (props.routeLink) {
            return html`
                <a
                    href=${linkUrl}
                    @click=${(clickEvent: MouseEvent) => {
                        routeOnLinkClick(clickEvent, fullRoute, props.router);
                    }}
                    tabindex=${props.isAnchorFocusable ? '0' : '-1'}
                >
                    <slot></slot>
                </a>
            `;
        } else {
            console.error(`no route link provided for ${RouteLink.tagName}`);
            return html``;
        }
    },
});
