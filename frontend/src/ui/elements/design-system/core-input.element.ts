import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {randomString} from 'augment-vir';
import {css, defineElementEvent, html, onDomCreated} from 'element-vir';
import {live} from 'lit/directives/live.js';
import {
    monospaceFontVar,
    themeForegroundDimColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '../../styles/theme-vars';

const maxFocusAttemptCount = 3;

export const CoreInput = defineCreatorNftElement({
    tagName: 'tcnft-core-input',
    props: {
        value: undefined as string | undefined,
        placeholder: undefined as string | undefined,
        inputElement: undefined as HTMLInputElement | HTMLTextAreaElement | undefined,
        inputId: randomString(),
        label: undefined as string | undefined,
        multiline: false,
        maxLength: undefined as undefined | number,
        autoFocus: false,
        triggerFocus: false,
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

        input,
        textarea {
            font-size: 1em;
            flex-grow: 1;
            font-family: ${monospaceFontVar};
            width: 100%;
            box-sizing: border-box;
            resize: none;
            background: none;
            border: 2px solid ${themeForegroundDimColorVar};
            border-radius: 8px;
            color: inherit;
            padding: 4px 8px;
        }

        input:focus,
        textarea:focus {
            border-color: ${themeForegroundPrimaryAccentColorVar};
            outline: none;
        }
    `,
    renderCallback: ({props, dispatch, events}) => {
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

        return html`
            ${props.label
                ? html`
                      <label for=${props.inputId}>${props.label}</label>
                  `
                : ''}
            ${props.multiline
                ? html`
                      <textarea
                          id=${props.inputId}
                          ?autofocus=${props.autoFocus}
                          ${onDomCreated((inputElement) => {
                              if (!(inputElement instanceof HTMLTextAreaElement)) {
                                  throw new Error(
                                      'Input was created but is not of type HTMLTextAreaElement??',
                                  );
                              }

                              props.inputElement = inputElement;
                          })}
                          @keydown=${(event: KeyboardEvent) => {
                              if (event.key.toLowerCase() === 'enter') {
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
        `;
    },
});
