import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    defaultFontVar,
    themeBackgroundColorVar,
    themeForegroundColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {css, html} from 'element-vir';

function findAppropriateStroke(props: {strokeMapping: [number, number][]; size: number}) {
    const entry =
        props.strokeMapping.find((currentEntry, currentIndex, array) => {
            const nextEntry = array[currentIndex + 1];
            if (!nextEntry) {
                return true;
            }
            return nextEntry[0] < props.size && props.size <= currentEntry[0];
        }) ?? props.strokeMapping[0];

    if (!entry) {
        throw new Error(`No loading indicator stroke mapping found!`);
    }

    return entry[1];
}

export const LoadingIndicator = defineCreatorNftElement({
    tagName: 'tcnft-loading-indicator',
    props: {
        size: 80,
        animationDurationMs: 600,
        isLoading: false,
        label: undefined as string | undefined,
        strokeMapping: (
            [
                // prettier-elements-per-line: 2
                [
                    160, 2,
                ],
                // prettier-elements-per-line: 2
                [
                    80, 3,
                ],
                // prettier-elements-per-line: 2
                [
                    32, 5,
                ],
                // prettier-elements-per-line: 2
                [
                    16, 5,
                ],
            ] as [number, number][]
        ).sort((a, b) => b[0] - a[0]),
        lastShowTime: undefined as number | undefined,
        hideTimeoutId: undefined as number | undefined,
    },
    styles: css`
        :host {
            --tcnft-loading-indicator-spin-overlap-offset: 10ms;
            --tcnft-loading-indicator-stroke-width: 2;
            --tcnft-loading-indicator-svg-size: 80px;

            font-family: ${defaultFontVar};
            --tcnft-loading-indicator-shrink-duration: calc(
                var(--tcnft-loading-indicator-spin-duration, 600ms) / 2
            );
            --tcnft-loading-indicator-grow-delay: calc(
                var(--tcnft-loading-indicator-spin-duration, 600ms) / 5
            );
            height: 100%;
            width: 100%;
            min-height: var(--tcnft-loading-indicator-svg-size);
            inset: 0;
            position: absolute;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: ${themeBackgroundColorVar};
            font: inherit;
        }

        .spinny {
            fill: none;
            stroke-width: var(--tcnft-loading-indicator-stroke-width);
        }

        .outer-spinny {
            stroke: ${themeForegroundPrimaryAccentColorVar};
        }

        .inner-spinny {
            stroke: ${themeForegroundColorVar};
            /* pi * 2 * 18 (radius) / 4 */
            stroke-dasharray: 28.2743;
            animation: var(--tcnft-loading-indicator-spin-duration, 600ms) linear spinny infinite;
        }

        :host(.tcnft-loading-indicator-done-spinning) {
            transition: calc(
                    var(--tcnft-loading-indicator-shrink-duration) -
                        var(--tcnft-loading-indicator-grow-delay)
                )
                ease-in calc(var(--tcnft-loading-indicator-grow-delay) * 2);

            opacity: 0;
        }

        :host(.tcnft-loading-indicator-done-spinning) .outer-spinny {
            transition: calc(
                    var(--tcnft-loading-indicator-shrink-duration) -
                        var(--tcnft-loading-indicator-grow-delay)
                )
                ease-in var(--tcnft-loading-indicator-grow-delay);
            transform: scale(1.2);
            opacity: 0;
        }

        :host(.tcnft-loading-indicator-done-spinning) .inner-spinny-wrapper {
            animation: var(--tcnft-loading-indicator-shrink-duration) linear reverse-spinny-shrink
                forwards;
        }

        .svg-wrapper {
            position: relative;
            height: var(--tcnft-loading-indicator-svg-size);
            width: var(--tcnft-loading-indicator-svg-size);
        }

        .loading-label {
            margin-left: 8px;
        }

        svg {
            position: absolute;
            inset: 0;
            height: 100%;
            width: 100%;
        }

        @keyframes spinny {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes reverse-spinny-shrink {
            from {
                transform: rotate(0deg) scale(1);
            }
            40% {
                transform: rotate(-72deg) scale(1.2);
            }
            60% {
                transform: rotate(-108deg) scale(1);
            }
            80% {
                transform: rotate(-144deg) scale(1);
                opacity: 1;
            }
            to {
                opacity: 0;
                transform: rotate(-180deg) scale(0);
            }
        }

        :host(.tcnft-loading-indicator-hidden) {
            display: none;
        }
    `,
    renderCallback: ({props, host}) => {
        host.style.setProperty(
            '--tcnft-loading-indicator-spin-duration',
            `${props.animationDurationMs}ms`,
        );

        host.style.setProperty('--tcnft-loading-indicator-svg-size', `${props.size}px`);
        host.style.setProperty(
            '--tcnft-loading-indicator-stroke-width',
            `${findAppropriateStroke(props)}px`,
        );

        if (props.isLoading) {
            host.classList.remove('tcnft-loading-indicator-done-spinning');
            if (props.hideTimeoutId) {
                window.clearTimeout(props.hideTimeoutId);
                props.hideTimeoutId = undefined;
            }
            host.classList.remove('tcnft-loading-indicator-hidden');
            props.lastShowTime = Date.now();
        } else {
            if (props.hideTimeoutId) {
                window.clearTimeout(props.hideTimeoutId);
            }
            const addHidden = () => {
                host.classList.add('tcnft-loading-indicator-hidden');
            };
            // if the loading indicator was only briefly open, just abruptly hide it
            if (!props.lastShowTime || Date.now() - props.lastShowTime < 250) {
                host.classList.remove('tcnft-loading-indicator-done-spinning');
                addHidden();
            } else {
                host.classList.add('tcnft-loading-indicator-done-spinning');
                props.hideTimeoutId = window.setTimeout(
                    addHidden,
                    props.animationDurationMs +
                        // just a little buffer to make sure the animation is finished
                        10,
                );
            }
            props.lastShowTime = undefined;
        }

        return html`
            <div class="svg-wrapper">
                <svg viewBox="-40 -40 80 80" xmlns="http://www.w3.org/2000/svg">
                    <circle class="spinny outer-spinny" cx="0" cy="0" r="24" />
                    <g class="inner-spinny-wrapper">
                        <circle class="spinny inner-spinny" cx="0" cy="0" r="18" />
                    </g>
                </svg>
            </div>
            ${props.label
                ? html`
                      <span class="loading-label">${props.label}</span>
                  `
                : ''}
        `;
    },
});
