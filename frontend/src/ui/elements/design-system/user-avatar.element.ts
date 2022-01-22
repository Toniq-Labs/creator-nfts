import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    applyThemeColors,
    monospaceFontVar,
    overlayActiveOpacityVar,
    overlayHoverOpacityVar,
    themeBackgroundColorVar,
    themeForegroundColorVar,
    themeForegroundPrimaryAccentColorVar,
    themeInteractionTransitionTimeVar,
    themeMenuShadowColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {menuZ} from '@frontend/src/ui/styles/z-index';
import {css, html} from 'element-vir';
import {TemplateResult} from 'lit';

export const UserAvatar = defineCreatorNftElement({
    tagName: 'tcnft-user-avatar',
    props: {
        username: undefined as undefined | string,
        avatarUrl: undefined as undefined | string,
        loadingAvatarUrl: undefined as undefined | Promise<HTMLImageElement>,
        loadedAvatarImage: undefined as undefined | HTMLImageElement,
        windowListener: undefined as undefined | ((event: MouseEvent) => void),
        /**
         * Start with undefined so that there is a third state (in addition to "opened" and
         * "closed") which indicates the menu state before any user interaction. This allows the
         * menu to be completely hidden on page load (rather than animating from opened -> closed on
         * page load).
         */
        menuOpened: undefined as undefined | boolean,
        menuEnabled: false,
        clickListener: undefined as undefined | ((event: MouseEvent) => void),
    },
    styles: css`
        :host {
            height: 48px;
            width: 48px;
            border: 2px solid ${themeForegroundPrimaryAccentColorVar};
            border-radius: 50%;
            position: relative;
            ${applyThemeColors}
        }

        .avatar-circle {
            overflow: hidden;
            border-radius: inherit;
            position: relative;
            padding: 8px;
            font-family: ${monospaceFontVar};
            box-sizing: border-box;
            height: 48px;
            width: 48px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 18px;
        }

        .overlay {
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;

            opacity: 0;
            transition: ${themeInteractionTransitionTimeVar};
            background-color: ${themeForegroundColorVar};
        }

        .avatar-image,
        .overlay {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
        }

        .avatar-image {
            width: 100%;
            height: 100%;
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
        }

        .no-avatar {
            display: none;
        }

        .avatar-image-background {
            position: absolute;
            width: 100%;
            height: 100%;
            ${applyThemeColors}
        }

        *:hover > .overlay {
            opacity: ${overlayHoverOpacityVar};
        }

        *:active > .overlay {
            opacity: ${overlayActiveOpacityVar};
        }

        .avatar-menu {
            --tcnft-user-avatar-avatar-menu-padding: 24px;
            position: absolute;
            top: 100%;
            right: calc(0px - var(--tcnft-user-avatar-avatar-menu-padding));
            padding: 0;
            border: inherit;
            border-width: 0;
            max-height: 100vh;
            overflow: hidden;
            /* prevent border pixel twitching */
            padding: var(--tcnft-user-avatar-avatar-menu-padding);
            padding-top: 0;
            margin-top: 1px;
            transition-property: visibility;
            transition-duration: 0s;
            transition-delay: ${themeInteractionTransitionTimeVar};
            visibility: visible;
            z-index: ${menuZ};
        }

        .avatar-menu ul {
            box-sizing: border-box;
            /* include 10px to compensate for pixel twitch padding above */
            transform: translateY(calc(-100% - var(--tcnft-user-avatar-avatar-menu-padding)));
            position: relative;
            border-radius: 2px;
            display: flex;
            transition: transform ${themeInteractionTransitionTimeVar} ease-in-out;
            flex-direction: column;
            padding: 0;
            background-color: ${themeBackgroundColorVar};
            border: inherit;
            margin: 0;
            border-width: 1px;
            box-shadow: 0 6px 12px 8px ${themeMenuShadowColorVar};
        }

        .avatar-menu ul.shown {
            transform: translateY(0%);
            visibility: visible;
        }

        .avatar-menu.hidden {
            visibility: hidden;
        }

        .avatar-menu li {
            position: relative;
            list-style: none;
            padding: 4px 8px;
            white-space: nowrap;
            cursor: pointer;
        }

        .avatar-menu li + li {
            border-top: 1px solid;
            border-color: inherit;
        }
    `,
    renderCallback: ({props}) => {
        if (props.menuOpened && props.menuEnabled && !props.windowListener) {
            props.windowListener = () => {
                if (props.menuOpened) {
                    props.menuOpened = false;
                }
            };
            window.addEventListener('click', props.windowListener);
        }

        if (props.avatarUrl && !props.loadingAvatarUrl) {
            props.loadingAvatarUrl = new Promise<HTMLImageElement>((resolve, reject) => {
                if (props.avatarUrl) {
                    const image = new Image();
                    image.onload = () => {
                        // image loading succeeded
                        props.loadedAvatarImage = image;
                        resolve(image);
                    };
                    image.onerror = () => {
                        // image loading failed
                        /**
                         * No need to reject this right now cause nobody is using this promise and
                         * if we reject it, at least some browsers log a "Unresolved Promise
                         * Rejection" error in the console.
                         */
                        // reject(`failed to load ${props.avatarUrl}`);
                    };
                    image.src = props.avatarUrl;
                } else {
                    reject('props.avatarUrl no longer exists');
                }
            });
        }

        return html`
            <div
                title=${props.username}
                class="avatar-circle"
                @click=${(event: MouseEvent) => {
                    if (props.menuEnabled) {
                        event.preventDefault();
                        event.stopPropagation();
                        if (props.menuOpened) {
                            props.menuOpened = false;
                        } else {
                            props.menuOpened = true;
                        }
                    }
                }}
            >
                <div class="avatar-image-background ${props.loadedAvatarImage ? '' : 'no-avatar'}">
                    <div
                        class="avatar-image"
                        style="background-image: url('${props.loadedAvatarImage?.src}');"
                    ></div>
                </div>
                ${props.menuEnabled
                    ? html`
                          <div class="overlay"></div>
                      `
                    : ''}
                ${avatarName(props.username)}
            </div>
            ${props.menuEnabled
                ? html`
                      <div class="avatar-menu ${props.menuOpened ? '' : 'hidden'}">
                          <ul
                              @click=${(event: MouseEvent) => {
                                  if (props.menuEnabled) {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      props.menuOpened = false;
                                  }
                              }}
                              class=${props.menuOpened === true ? 'shown' : ''}
                          >
                              <slot></slot>
                          </ul>
                      </div>
                  `
                : ''}
        `;
    },
});

function avatarName(username: string | undefined): TemplateResult {
    if (!username) {
        return html``;
    }

    let shortName = username.slice(0, 7).toUpperCase();

    // used when the username is a wallet principal
    const principalDashIndex = shortName.indexOf('-');
    const originalSpaceIndex = shortName.indexOf(' ');
    // only allow space breaks if they're within the first three characters
    const spaceIndex = originalSpaceIndex > 3 ? -1 : originalSpaceIndex;

    if (principalDashIndex > -1) {
        shortName = shortName.slice(0, principalDashIndex);
    }
    if (spaceIndex > -1) {
        // only replace the first space
        shortName = shortName.replace(' ', '');
    }
    shortName = shortName.slice(0, 6);

    if (shortName.length <= 3) {
        return html`
            ${shortName}
        `;
    } else {
        // prettier-ignore
        const wordBreak = html`<wbr />`;
        if (spaceIndex > -1) {
            return html`
                ${shortName.slice(0, spaceIndex)}${wordBreak}${shortName.slice(
                    spaceIndex,
                    spaceIndex + 3,
                )}
            `;
        } else if (shortName.length < 6) {
            // prettier-ignore
            return html`${shortName.slice(0, 2)}${wordBreak}${shortName.slice(2)}`;
        } else {
            // prettier-ignore
            return html`${shortName.slice(0, 3)}${wordBreak}${shortName.slice(3)}`;
        }
    }
}
