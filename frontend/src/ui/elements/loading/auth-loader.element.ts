import {createNewAuth} from '@frontend/src/auth/create-new-auth';
import {tryToLoadAuthWithRetires} from '@frontend/src/auth/load-current-auth';
import {removeCurrentAuth} from '@frontend/src/auth/remove-current-auth';
import {NftUser} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {extractErrorMessage} from 'augment-vir';
import {css, defineElementEvent, html, RenderParams} from 'element-vir';

function loadAuth({
    events,
    dispatch,
    props,
}: Pick<
    RenderParams<
        NonNullable<typeof AuthLoader.initInput.props>,
        NonNullable<typeof AuthLoader.initInput.events>
    >,
    'props' | 'dispatch' | 'events'
>) {
    if (!props.signingInPromise) {
        throw new Error(`Forgot to set signingInPromise before calling loadAuth.`);
    }

    props.signingInPromise
        .then((newAuth) => {
            props.loadedUserId = newAuth;
            dispatch(new events.userIdLoaded(newAuth));
        })
        .catch((error) => {
            console.error(error);
            removeCurrentAuth();
            dispatch(new events.userIdLoadingError(extractErrorMessage(error)));
        })
        .finally(() => {
            props.signingInPromise = undefined;
        });
    return;
}

export const AuthLoader = defineCreatorNftElement({
    tagName: 'tcnft-auth-loader',
    props: {
        signInNow: false,
        loadedUserId: undefined as NftUser | undefined,
        isCreatorPromise: undefined as Promise<void> | undefined,
        signingInPromise: undefined as Promise<NftUser | undefined> | undefined,
    },
    events: {
        userIdLoaded: defineElementEvent<NftUser | undefined>(),
        userIdLoadingError: defineElementEvent<string>(),
    },
    styles: css`
        :host {
            /* Just a helper element, nothing to display on the UI */
            display: none;
        }
    `,
    initCallback: ({props, dispatch, events}) => {
        props.signingInPromise = tryToLoadAuthWithRetires();
        loadAuth({props, dispatch, events});
    },
    renderCallback: ({props, dispatch, events}) => {
        if (props.signInNow) {
            props.signInNow = false;
            if (!props.signingInPromise && !props.loadedUserId) {
                props.signingInPromise = createNewAuth();

                loadAuth({props, dispatch, events});
            }
        }

        return html``;
    },
});
