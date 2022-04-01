import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    monospaceFontVar,
    symbolFontVar,
    themeBackgroundColorVar,
    themeEffectTransitionTimeVar,
    themeErrorColorVar,
    themeForegroundDimColorVar,
    themeForegroundPrimaryAccentColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {randomString} from 'augment-vir';
import {css, defineElementEvent, html, listen, onDomCreated} from 'element-vir';
import {TemplateResult} from 'lit';
import {live} from 'lit/directives/live.js';

export type SelectOption = {
    label: string;
    value: string;
};

export const CoreSelect = defineCreatorNftElement({
    tagName: 'tcnft-core-select',
    props: {
        label: 'select-label',
        value: undefined as string | undefined,
        placeholder: '',
        inputRequired: false,
        options: [] as SelectOption[],
        // this is set in the initCallback
        selectId: '',
        selectElement: undefined as HTMLSelectElement | undefined,
        caption: undefined as undefined | string,
    },
    events: {
        valueChange: defineElementEvent<string>(),
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
        }

        .select-wrapper {
            cursor: pointer;
            display: flex;
            flex-grow: 1;
            border: 2px solid ${themeForegroundDimColorVar};
            transition: border ${themeInteractionTransitionTimeVar};
            border-radius: 8px;
            margin: 2px 0;
            position: relative;
        }

        :host(.tcnft-core-select-warning) .select-wrapper {
            border-color: ${themeErrorColorVar};
        }

        :host(.tcnft-core-select-warning) select {
            font-weight: bold;
        }

        :host(.tcnft-core-select-warning) option {
            font-weight: normal;
        }

        select option {
            font-weight: normal;
            font: inherit;
            color: var(--tcnft-theme-light-foreground-color);
        }

        :host(.tcnft-core-select-warning) .caption {
            color: ${themeErrorColorVar};
            font-weight: bold;
        }

        :host(.tcnft-core-select-warning) .carets {
            color: ${themeBackgroundColorVar};
        }

        :host(.tcnft-core-select-warning) .carets {
            background-color: ${themeErrorColorVar};
        }

        :host(.tcnft-core-select-no-value) select {
            color: ${themeForegroundDimColorVar};
        }

        .carets {
            position: absolute;
            z-index: 0;
            right: 1px;
            top: 1px;
            width: 17px;
            height: 23px;
            font-family: ${symbolFontVar};
            box-sizing: border-box;
            background-color: ${themeForegroundPrimaryAccentColorVar};
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            padding: 0 4px;
            font-size: 1.1em;
            align-items: center;
            color: white;
        }

        .carets span {
            margin-right: -1px;
            width: 10px;
            height: 8px;
            text-align: center;
            display: flex;
            justify-content: center;
        }

        .select-wrapper:active {
            border-color: ${themeForegroundPrimaryAccentColorVar};
        }

        select {
            position: relative;
            font: inherit;
            font-family: ${monospaceFontVar};
            cursor: inherit;
            margin: 0;
            border: none;
            z-index: 1;
            flex-grow: 1;
            display: flex;
            box-sizing: border-box;
            background: none;
            outline: none;
            -webkit-appearance: none;
            appearance: none;
            color: inherit;
            padding: 4px 8px;
            padding-right: 19px;
        }

        .caption {
            opacity: 0;
            word-break: break-all;
            width: 100%;
            font-size: 0.9em;
            box-sizing: border-box;
            flex-shrink: 0;
            margin-bottom: 8px;
            padding-left: 4px;
            transition: ${themeEffectTransitionTimeVar};

            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .show-caption {
            opacity: 1;
        }
    `,
    initCallback: ({props}) => {
        if (!props.selectId) {
            props.selectId = randomString();
        }
    },
    renderCallback: ({props, events, dispatch, host}) => {
        const emptyStringAllowed = props.options.some((option) => option.value === '');

        const noValue = emptyStringAllowed ? props.value == undefined : !props.value;

        if (props.inputRequired && noValue) {
            host.classList.add('tcnft-core-select-warning');
        } else {
            host.classList.remove('tcnft-core-select-warning');
        }

        if (noValue) {
            host.classList.add('tcnft-core-select-no-value');
        } else {
            host.classList.remove('tcnft-core-select-no-value');
        }

        // if current value does not exist in available options
        if (
            props.value &&
            props.options.length &&
            props.options.filter((option) => option.value === props.value).length === 0
        ) {
            props.value = '';
        }
        const labelTemplate: TemplateResult | string =
            props.label == undefined
                ? ''
                : html`
                      <label for=${props.selectId}>${props.label}</label>
                  `;

        const placeholderOption: TemplateResult | string = props.placeholder
            ? html`
                  <option class="placeholder" selected disabled value="">
                      ${props.placeholder}
                  </option>
              `
            : '';

        const caption: TemplateResult | string =
            props.caption == undefined
                ? ''
                : html`
                      <span class="caption ${props.caption ? 'show-caption' : ''}">
                          ${props.caption.trim() ||
                          html`
                              &nbsp;
                          `}
                      </span>
                  `;

        return html`
            ${labelTemplate}
            <div
                class="select-wrapper"
                ${listen('click', (event) => {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    // this does not work on firefox
                    props.selectElement?.dispatchEvent(new MouseEvent('mousedown'));
                    props.selectElement?.click();
                })}
            >
                <select
                    ${onDomCreated((element) => {
                        if (!(element instanceof HTMLSelectElement)) {
                            throw new Error(`Got element but was not a select element: ${element}`);
                        }

                        props.selectElement = element;
                    })}
                    id=${props.selectId}
                    .value=${live(props.value)}
                    ${listen('change', () => {
                        if (!props.selectElement) {
                            throw new Error(
                                `Got change event but haven't found select element yet.`,
                            );
                        }

                        const newValue = props.selectElement.value;

                        props.value = newValue;
                        dispatch(new events.valueChange(newValue));
                    })}
                >
                    ${placeholderOption}
                    ${props.options.map((option) => {
                        return html`
                            <option ?selected=${props.value === option.value} value=${option.value}>
                                ${option.label}
                            </option>
                        `;
                    })}
                </select>
                <div class="carets">
                    <span>˄</span>
                    <span>˅</span>
                </div>
            </div>
            ${caption}
        `;
    },
});
