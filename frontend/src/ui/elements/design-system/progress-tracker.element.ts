import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    monospaceFontVar,
    symbolFontVar,
    themeAcceptColorHighlightColorVar,
    themeAcceptColorVar,
    themeBackgroundColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {css, html} from 'element-vir';

export type UnlockProgress = {
    current: number;
    required: number;
};

export const ProgressTracker = defineCreatorNftElement({
    tagName: 'tcnft-progress-tracker',
    props: {
        unlockProgress: undefined as UnlockProgress | undefined,
        phrases: {
            complete: 'Access granted!',
            needMore: 'Mint more NFTs! (Use Mint button in top right corner.)',
            incompleteNftCount(current: number, required: number) {
                return `${current}/${required} required NFTs`;
            },
            completeNftCount(current: number, required: number) {
                return `${current}/${required} NFTs`;
            },
        } as const,
    },
    styles: css`
        :host {
            --tcnft-progress-tracker-background-size: 1.5em;
            position: relative;
            display: flex;
            gap: 8px;
            align-items: center;
        }

        span {
            font-family: ${monospaceFontVar};
            font-size: 1.1em;
        }

        .check-mark {
            margin-top: 1px;
            display: none;
            color: ${themeAcceptColorVar};
            font-family: ${symbolFontVar};
            height: 100%;
            width: 100%;
            font-size: 0.9em;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        :host(.tcnft-progress-tracker-complete) .progress-track {
            width: 18px;
            min-width: 18px;
            max-width: 18px;
        }

        :host(.tcnft-progress-tracker-complete) .track-part {
            display: none;
        }

        :host(.tcnft-progress-tracker-complete) .check-mark {
            display: flex;
        }

        .progress-track {
            min-width: 36px;
            flex-shrink: 0;
            flex-grow: 1;
            height: 18px;
            position: relative;
            border-radius: 9px;
            display: inline-flex;
            /*
                Pixel aliasing issues occur when there's a border with no background color and then
                a child with height/width 100% and a background color (the animated part). So,
                instead of trying to fight that (with inconsistent results), we just own it and make
                it part of the styling (thus preventing it) with this padding.
                Instead of just using 1px (which makes it look like a mistake still), use 2px so
                that it's obviously a style choice.
            */
            padding: 2px;
            border: 1px solid ${themeAcceptColorVar};
            box-sizing: border-box;
            overflow: hidden;
            align-items: stretch;
        }

        .track-part {
            background-color: ${themeAcceptColorVar};
            border-radius: inherit;
            position: relative;
            overflow: hidden;
            height: 100%;
            width: 100%;
        }

        .animated-part {
            opacity: 0.92;
            background: linear-gradient(
                -45deg,
                ${themeBackgroundColorVar} 15%,
                /*
                    can't use transparent here because it's treated as black with 0 opacity which 
                    messes up the gradient transition
                */
                    ${themeAcceptColorHighlightColorVar} 15%,
                ${themeAcceptColorHighlightColorVar} 35%,
                ${themeBackgroundColorVar} 35%,
                ${themeBackgroundColorVar} 60%,
                ${themeAcceptColorHighlightColorVar} 60%,
                ${themeAcceptColorHighlightColorVar} 85%,
                ${themeBackgroundColorVar} 85%
            );
            background-repeat: repeat no-repeat;
            background-size: var(--tcnft-progress-tracker-background-size)
                var(--tcnft-progress-tracker-background-size);
            margin: -1px;
            height: calc(100% + 2px);
            width: calc(100% + 2px);
            animation: tracker-movement 1.5s infinite linear;
        }

        @keyframes tracker-movement {
            to {
                background-position: var(--tcnft-progress-tracker-background-size) 0;
            }
        }
    `,
    renderCallback: ({props, host}) => {
        if (!props.unlockProgress) {
            return html``;
        }

        const width = props.unlockProgress.required
            ? Math.min(
                  100,
                  Math.round((props.unlockProgress.current / props.unlockProgress.required) * 100),
              )
            : 100;

        if (width === 100) {
            host.classList.add('tcnft-progress-tracker-complete');
            host.setAttribute('title', props.phrases.complete);
        } else {
            host.classList.remove('tcnft-progress-tracker-complete');
            host.setAttribute('title', props.phrases.needMore);
        }

        const phrase =
            width === 100
                ? props.phrases.completeNftCount(
                      props.unlockProgress.current,
                      props.unlockProgress.required,
                  )
                : props.phrases.incompleteNftCount(
                      props.unlockProgress.current,
                      props.unlockProgress.required,
                  );

        return html`
            <div class="progress-track">
                <div class="check-mark">✔</div>
                <div class="track-part" style="width: ${width}%;">
                    <div class="animated-part"></div>
                </div>
            </div>
            <span>${phrase}</span>
        `;
    },
});
