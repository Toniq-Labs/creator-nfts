import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    themeEffectTransitionTimeVar,
    themeErrorColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {randomString} from 'augment-vir';
import {css, defineElementEvent, html, onDomCreated, onResize} from 'element-vir';
import {TemplateResult} from 'lit';
import {live} from 'lit/directives/live.js';
import {
    monospaceFontVar,
    themeForegroundDimColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '../../styles/theme-vars';

const maxFocusAttemptCount = 3;

export const CoreTextInput = defineCreatorNftElement({
    tagName: 'tcnft-core-text-input',
    props: {
        value: undefined as string | undefined,
        placeholder: undefined as string | undefined,
        inputElement: undefined as HTMLInputElement | HTMLTextAreaElement | undefined,
        // this is set in the initCallback
        inputId: '',
        noAutoStuff: false,
        label: undefined as string | undefined,
        caption: undefined as string | undefined,
        multiline: false,
        maxLength: undefined as undefined | number,
        autoFocus: false,
        triggerFocus: false,
        fullHeight: false,
        allowMultilineEnter: false,
    },
    events: {
        valueChange: defineElementEvent<string>(),
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }

        :host(.tcnft-core-text-input-warning) .caption {
            color: ${themeErrorColorVar};
            font-weight: bold;
        }

        :host(.tcnft-core-text-input-warning) input,
        :host(.tcnft-core-text-input-warning) textarea {
            border-color: ${themeErrorColorVar};
            color: ${themeErrorColorVar};
            font-weight: bold;
        }

        :host(.tcnft-core-text-input-monospace-caption) {
            font-family: ${monospaceFontVar};
            font-size: inherit;
        }

        :host(.tcnft-core-text-input-full-color-caption) .caption {
            color: inherit;
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

        input,
        textarea {
            font-size: 1em;
            flex-grow: 1;
            font-family: ${monospaceFontVar};
            width: 100%;
            box-sizing: border-box;
            resize: none;
            background: none;
            margin: 2px 0;
            border: 2px solid ${themeForegroundDimColorVar};
            border-radius: 8px;
            color: inherit;
            padding: 4px 8px;
            transition: border ${themeInteractionTransitionTimeVar};
        }

        textarea {
            min-height: 3em;
        }

        input::placeholder,
        textarea::placeholder {
            color: ${themeForegroundDimColorVar};
            font-family: ${monospaceFontVar};
        }

        :host input:focus,
        :host textarea:focus {
            border-color: ${themeForegroundPrimaryAccentColorVar};
            outline: none;
        }
    `,
    initCallback: ({props}) => {
        if (!props.inputId) {
            props.inputId = randomString();
        }
    },
    renderCallback: ({props, dispatch, events, host}) => {
        let focusAttempts = 0;
        function setFocus() {
            if (props.inputElement && props.triggerFocus) {
                props.inputElement.focus();
                // this is awful but accounts for animations and stuff
                if (props.inputElement.matches(':focus')) {
                    props.triggerFocus = false;
                } else if (focusAttempts <= maxFocusAttemptCount) {
                    focusAttempts++;

                    requestAnimationFrame(() => {
                        // try again
                        setFocus();
                    });
                }
            }
        }

        setFocus();

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

        function makeFullHeight() {
            if (props.fullHeight && props.multiline && props.inputElement) {
                const hostHeight = host.clientHeight;
                const hostPreviousMinHeight = host.style.minHeight;

                host.style.minHeight = `${hostHeight}px`;

                // set the input height really small so we force scroll content
                props.inputElement.style.height = '1px';
                props.inputElement.style.maxHeight = '1px';
                const elementScrollHeight = props.inputElement.scrollHeight;

                props.inputElement.style.height = elementScrollHeight
                    ? `calc(${elementScrollHeight}px + 1em)`
                    : '';
                props.inputElement.style.removeProperty('max-height');

                // the min-height must be removed so that the input can shrink when it needs to
                if (hostPreviousMinHeight) {
                    host.style.minHeight = hostPreviousMinHeight;
                } else {
                    host.style.removeProperty('min-height');
                }
            }
        }

        makeFullHeight();

        return html`
            ${label}
            ${props.multiline
                ? html`
                      <textarea
                          autocomplete=${props.noAutoStuff ? 'off' : ''}
                          autocorrect=${props.noAutoStuff ? 'off' : ''}
                          autocapitalize=${props.noAutoStuff ? 'off' : ''}
                          spellcheck=${props.noAutoStuff ? 'false' : ''}
                          id=${props.inputId}
                          ?autofocus=${props.autoFocus}
                          ${onResize(() => {
                              makeFullHeight();
                          })}
                          ${onDomCreated((inputElement) => {
                              if (!(inputElement instanceof HTMLTextAreaElement)) {
                                  throw new Error(
                                      'Input was created but is not of type HTMLTextAreaElement??',
                                  );
                              }

                              props.inputElement = inputElement;
                          })}
                          @keydown=${(event: KeyboardEvent) => {
                              if (
                                  event.key.toLowerCase() === 'enter' &&
                                  !props.allowMultilineEnter
                              ) {
                                  event.preventDefault();
                              }
                          }}
                          @input=${(event: InputEvent) => {
                              if (!props.inputElement) {
                                  throw new Error(
                                      `Value change triggered but input element not found yet.`,
                                  );
                              }

                              const newValue = props.inputElement.value;
                              dispatch(new events.valueChange(newValue));
                          }}
                          placeholder=${props.placeholder ?? ''}
                          .value=${live(props.value ?? '')}
                          maxlength=${props.maxLength}
                          resize="false"
                      ></textarea>
                  `
                : html`
                      <input
                          autocomplete=${props.noAutoStuff ? 'off' : ''}
                          autocorrect=${props.noAutoStuff ? 'off' : ''}
                          autocapitalize=${props.noAutoStuff ? 'off' : ''}
                          spellcheck=${props.noAutoStuff ? 'false' : ''}
                          id=${props.inputId}
                          ?autofocus=${props.autoFocus}
                          ${onDomCreated((inputElement) => {
                              if (!(inputElement instanceof HTMLInputElement)) {
                                  throw new Error(
                                      'Input was created but is not of type HTMLInputElement??',
                                  );
                              }

                              props.inputElement = inputElement;
                          })}
                          @input=${() => {
                              if (!props.inputElement) {
                                  throw new Error(
                                      `Value change triggered but input element not found yet.`,
                                  );
                              }

                              const newValue = props.inputElement.value;
                              dispatch(new events.valueChange(newValue));
                          }}
                          placeholder=${props.placeholder ?? ''}
                          .value=${live(props.value ?? '')}
                          type="text"
                          maxlength=${props.maxLength}
                      />
                  `}
            ${caption}
        `;
    },
});
