import {clamp} from '@frontend/src/augments/number';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    themeErrorColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {randomString} from 'augment-vir';
import {css, defineElementEvent, html, listen, onDomCreated} from 'element-vir';
import {TemplateResult, unsafeCSS} from 'lit';
import {
    monospaceFontVar,
    themeForegroundDimColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '../../styles/theme-vars';

const maxFocusAttemptCount = 3;

export const coreNumberInputWidthVarName = unsafeCSS('--tcnft-core-number-input-input-box-width');

function isValidInput(props: NonNullable<typeof CoreNumberInput.initInput.props>): boolean {
    if (!props.inputElement) {
        console.error('No input element found yet.');
        return false;
    }

    /**
     * This covers the case where nothing has been input yet OR the typed in value is not a valid
     * number, which results in the browser setting the empty string for the input value, thus
     * resulting in an undefined value for us in props.value.
     */
    if (props.value == undefined) {
        // this covers the case when nothing has been entered by the user
        if (props.lastInputString.input === '') {
            if (props.inputIsRequired) {
                return false;
            } else {
                return true;
            }
        }
        // this covers the case where the user input is not a valid numeric value
        else {
            return false;
        }
    }

    if (isNaN(props.value)) {
        return false;
    } else {
        const clamped = clampByProps(props.value, props);

        if (
            // make sure the value is properly clamped
            clamped === props.value &&
            !isNaN(Number(props.lastInputString.input))
        ) {
            return true;
        } else {
            return false;
        }
    }
}

function setInvalidInputProperty(props: NonNullable<typeof CoreNumberInput.initInput.props>): void {
    if (isValidInput(props)) {
        props.invalidInput = false;
    } else {
        props.invalidInput = true;
    }
}

function clampByProps(
    value: number,
    props: NonNullable<typeof CoreNumberInput.initInput.props>,
): number | undefined {
    const {maxValue, minValue} = calculateMinAndMaxByProps(props);

    return clamp({
        max: maxValue,
        min: minValue,
        value: value,
    });
}

function calculateMinAndMaxByProps(props: NonNullable<typeof CoreNumberInput.initInput.props>): {
    minValue: number;
    maxValue: number;
} {
    const maxValue = Math.min(props.maxValue ?? Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const filteredMinValue = props.minValue ?? -Infinity;
    const minValue = Math.max(
        filteredMinValue < maxValue ? filteredMinValue : Number.MIN_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
    );

    return {maxValue, minValue};
}

export const CoreNumberInput = defineCreatorNftElement({
    tagName: 'tcnft-core-number-input',
    props: {
        value: undefined as number | undefined,
        inputElement: undefined as HTMLInputElement | undefined,
        // this is set in initCallback
        inputId: '',
        /**
         * This is an object so its property can be changed without triggering rerenders. This
         * allows users to enter non-numeric entries without it wiping the input, which isn't
         * expected from a user's standpoint. The issue here is that when <input type="number"> is
         * used, some browsers will set it's value to the empty string if a non-numeric input is entered.
         */
        lastInputString: {input: ''},
        label: undefined as string | undefined,
        caption: undefined as string | undefined,
        maxValue: undefined as undefined | number,
        minValue: undefined as undefined | number,
        valueStep: undefined as undefined | number,
        inputIsRequired: false,
        autoFocus: false,
        triggerFocus: false,
        invalidInput: false,
    },
    events: {
        valueChange: defineElementEvent<number | undefined>(),
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }

        :host(.tcnft-core-number-input-warning) .caption {
            color: ${themeErrorColorVar};
            font-weight: bold;
        }

        :host(.tcnft-core-number-input-warning) input {
            border-color: ${themeErrorColorVar};
            color: ${themeErrorColorVar};
            font-weight: bold;
        }

        :host(.tcnft-core-number-input-warning) .control {
            border-color: ${themeErrorColorVar};
            color: ${themeErrorColorVar};
        }

        :host(.tcnft-core-number-input-monospace-caption) {
            font-family: ${monospaceFontVar};
            font-size: inherit;
        }

        .input-controls {
            transition: ${themeInteractionTransitionTimeVar};
            align-self: flex-start;
            display: flex;
            position: relative;
        }

        :host(.tcnft-core-number-input-full-color-caption) .caption {
            color: inherit;
        }

        .control {
            font-family: ${monospaceFontVar};
            font-size: 1.5em;
            position: absolute;
            border: 2px solid ${themeForegroundDimColorVar};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            top: 0;
            height: 100%;
            width: 24px;
            cursor: pointer;
            -webkit-user-select: none;
            user-select: none;
            transition: ${themeInteractionTransitionTimeVar};
        }

        .control:not(.disabled):hover {
            color: ${themeForegroundPrimaryAccentColorVar};
            border-color: ${themeForegroundPrimaryAccentColorVar};
        }

        .control.right:not(.disabled):hover ~ input {
            border-right-color: ${themeForegroundPrimaryAccentColorVar};
        }

        .control.left:not(.disabled):hover ~ input {
            border-left-color: ${themeForegroundPrimaryAccentColorVar};
        }

        .control.disabled {
            cursor: not-allowed;
            opacity: 0.4;
        }

        .control.left {
            left: 0;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: 0;
        }

        .control.right {
            right: 0;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left: 0;
        }

        .caption {
            opacity: 0;
            width: 100%;
            font-size: 0.9em;
            box-sizing: border-box;
            flex-shrink: 0;
            margin-bottom: 8px;
            padding-left: 4px;
            transition: ${themeInteractionTransitionTimeVar};

            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .show-caption {
            opacity: 1;
        }

        /* Hide Firefox number input arrows */
        input[type='number'] {
            -moz-appearance: textfield;
        }

        /* Hide Chromium and Safari browser arrows */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }

        input {
            margin: 0 24px;
            font-size: 1em;
            flex-grow: 1;
            font-family: ${monospaceFontVar};
            width: var(${coreNumberInputWidthVarName}, 100%);
            box-sizing: border-box;
            resize: none;
            background: none;
            border: 2px solid ${themeForegroundDimColorVar};
            color: inherit;
            padding: 4px 8px;
            transition: ${themeInteractionTransitionTimeVar};
        }

        :host input:focus {
            border-color: ${themeForegroundPrimaryAccentColorVar};
            outline: none;
            color: unset;
            font-weight: unset;
        }
    `,
    initCallback: ({props, host}) => {
        if (!props.inputId) {
            props.inputId = randomString();
        }
        host.addEventListener('blur', () => {
            setInvalidInputProperty(props);
        });
        // this is creating a new object reference so each instance gets a fresh object
        props.lastInputString = {input: props.value == undefined ? '' : String(props.value)};
    },
    renderCallback: ({props, dispatch, events, host}) => {
        const {maxValue, minValue} = calculateMinAndMaxByProps(props);
        const currentNumericValue: number | undefined =
            props.value == undefined ? undefined : Number(props.value);
        const valueStep = props.valueStep ?? 1;

        if (props.inputElement) {
            setInvalidInputProperty(props);
        }

        if (props.invalidInput) {
            host.classList.add('tcnft-core-number-input-warning');
        } else {
            host.classList.remove('tcnft-core-number-input-warning');
        }

        function setIncrement(step: number) {
            const startValue = currentNumericValue ?? 0;
            if (!isNaN(startValue)) {
                props.value = clampByProps(startValue + step, props);
                props.lastInputString.input = String(props.value);
                dispatch(new events.valueChange(props.value));
                props.invalidInput = false;
            }
        }

        let focusAttempts = 0;

        function setFocusMaybe() {
            if (props.inputElement && props.triggerFocus) {
                props.inputElement.focus();
                // this is awful but accounts for animations and stuff
                if (props.inputElement.matches(':focus')) {
                    props.triggerFocus = false;
                } else if (focusAttempts <= maxFocusAttemptCount) {
                    focusAttempts++;

                    requestAnimationFrame(() => {
                        // try again
                        setFocusMaybe();
                    });
                }
            }
        }
        setFocusMaybe();

        function handleInput(event: Event) {
            if (!props.inputElement) {
                throw new Error(`Value change triggered but input element not found yet.`);
            }
            if (!(event instanceof InputEvent)) {
                throw new Error(`Input listener event was not an InputEvent.`);
            }

            const inputValue = props.inputElement.value;
            const delta = event.data;
            const lastValue = props.lastInputString.input;

            let newValue = inputValue;

            // account for non-numeric inputs where the browser blocks .value access
            if (inputValue === '' && delta) {
                newValue = `${lastValue ?? ''}${delta}`;
            }

            props.lastInputString.input = newValue;

            const numericNewValue = Number(newValue);

            if (
                newValue === '' &&
                // when everything is deleted
                delta == null
            ) {
                props.inputElement.value = '';
                props.value = undefined;
                dispatch(new events.valueChange(undefined));
            } else if (!isNaN(numericNewValue)) {
                const clampedNewValue = clampByProps(numericNewValue, props);
                props.value = clampedNewValue;
                props.inputElement.value = String(props.value);
                dispatch(new events.valueChange(clampedNewValue));
            } else {
                dispatch(new events.valueChange(numericNewValue));
            }
            setInvalidInputProperty(props);
        }

        const label: TemplateResult | string =
            props.label == undefined
                ? ''
                : html`
                      <label for=${props.inputId}>${props.label}</label>
                  `;

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
            ${label}
            <div class="input-controls">
                <span
                    class="control left ${props.value != undefined && props.value <= minValue
                        ? 'disabled'
                        : ''}"
                    ${listen('click', () => {
                        setIncrement(-valueStep);
                    })}
                >
                    -
                </span>
                <span
                    class="control right ${props.value != undefined && props.value >= maxValue
                        ? 'disabled'
                        : ''}"
                    ${listen('click', () => {
                        setIncrement(valueStep);
                    })}
                >
                    +
                </span>

                <input
                    id=${props.inputId}
                    type="number"
                    ?autofocus=${props.autoFocus}
                    ${onDomCreated((inputElement) => {
                        if (!(inputElement instanceof HTMLInputElement)) {
                            throw new Error(
                                'Input was created but is not of type HTMLInputElement',
                            );
                        }

                        props.inputElement = inputElement;
                    })}
                    ${listen('input', handleInput)}
                    .value=${props.value ?? ''}
                    type="text"
                />
            </div>
            ${caption}
        `;
    },
});
