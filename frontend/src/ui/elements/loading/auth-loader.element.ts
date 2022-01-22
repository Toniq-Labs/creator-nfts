import {createNewAuth} from '@frontend/src/auth/create-new-auth';
import {loadCurrentAuth} from '@frontend/src/auth/load-current-auth';
import {NftUser} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {css, defineElementEvent, html} from 'element-vir';

export const AuthLoader = defineCreatorNftElement({
    tagName: 'tcnft-auth-loader',
    props: {
        signInNow: false,
        signOutNow: false,
        initialUserId: loadCurrentAuth(),
        loadingInitialUserIdPromise: undefined as Promise<void> | undefined,
        loadedUserId: undefined as NftUser | undefined,
        signingInPromise: undefined as Promise<NftUser | undefined> | undefined,
    },
    events: {
        userIdLoaded: defineElementEvent<NftUser | undefined>(),
    },
    styles: css`
        :host {
            /* Just a helper element, nothing to display on the UI */
            display: none;
        }
    `,
    renderCallback: async ({props, dispatch, events}) => {
        if (
            props.signInNow &&
            !props.loadedUserId &&
            !props.loadingInitialUserIdPromise &&
            !props.signingInPromise
        ) {
            props.signInNow = false;
            props.signingInPromise = createNewAuth();
            const newAuth = await props.signingInPromise;
            props.loadedUserId = newAuth;
            dispatch(new events.userIdLoaded(newAuth));
            props.signingInPromise = undefined;
        }

        if (!props.loadingInitialUserIdPromise && props.initialUserId) {
            props.loadingInitialUserIdPromise = props.initialUserId.then((initialUserId) => {
                dispatch(new events.userIdLoaded(initialUserId));
            });
        }

        return html``;
    },
});
