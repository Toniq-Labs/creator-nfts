import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CoreButton} from '@frontend/src/ui/elements/design-system/core-button.element';
import {
    themeErrorColorVar,
    themeForegroundDimColorVar,
    themeForegroundLightAccentColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, defineElementEvent, html, listen} from 'element-vir';

export const SharedDashboardEntry = defineCreatorNftElement({
    tagName: 'tcnft-shared-dashboard-entry',
    props: {
        creationType: '',
        entryExists: false,
        validEntries: false,
        editing: false,
        modified: false,
        canRevert: false,
        phrases: {
            delete: 'Delete',
            create: (type: string) => `Create New${type ? ` ${type}` : ''}`,
            done: 'Done',
            edit: 'Edit',
            modifiedTitle: 'Modified:',
            modifiedMessage: 'Save to canister to persist changes.',
            revert: 'Revert',
            cancel: 'Cancel',
        },
    },
    events: {
        createNew: defineElementEvent<void>(),
        delete: defineElementEvent<void>(),
        done: defineElementEvent<void>(),
        revert: defineElementEvent<void>(),
        edit: defineElementEvent<void>(),
    },
    styles: css`
        :host {
            border-radius: 8px;
            border: 1px solid ${themeForegroundDimColorVar};
            display: flex;
            flex-direction: column;
            padding: 16px;
            box-sizing: border-box;
        }

        .buttons {
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
            gap: 8px;
        }

        .buttons.data-exists {
            margin-top: 16px;
        }

        :host(.tcnft-creator-dashboard-entry-error) {
            border-color: ${themeErrorColorVar};
        }

        :host(.tcnft-creator-dashboard-entry-modified) {
            border-color: ${themeForegroundLightAccentColorVar};
            border-width: 4px;
        }

        :host(.tcnft-creator-dashboard-entry-empty) {
            border: none;
        }

        .warning-button {
            color: ${themeErrorColorVar};
        }

        .modified-message {
            margin-bottom: 24px;
        }

        .modified-title {
            color: ${themeForegroundPrimaryAccentColorVar};
            font-weight: bold;
        }

        .hidden {
            display: none;
        }
    `,
    renderCallback: ({props, host, events, dispatch}) => {
        if (props.entryExists) {
            host.classList.remove('tcnft-creator-dashboard-entry-empty');
        } else {
            host.classList.add('tcnft-creator-dashboard-entry-empty');
        }

        if (props.modified || props.editing) {
            host.classList.add('tcnft-creator-dashboard-entry-modified');
        } else {
            host.classList.remove('tcnft-creator-dashboard-entry-modified');
        }

        const revertEnabled = props.canRevert && props.modified;

        if (props.entryExists) {
            return html`
                ${props.modified && !props.editing
                    ? html`
                          <span class="modified-message">
                              <span class="modified-title">${props.phrases.modifiedTitle}</span>
                              ${props.phrases.modifiedMessage}
                          </span>
                      `
                    : ''}
                <slot></slot>
                <div class="buttons ${props.entryExists ? 'data-exists' : ''}">
                    ${props.editing
                        ? html`
                                <${CoreButton}
                                    class="tcnft-core-button-text-button warning-button"
                                    ${assign(CoreButton.props.label, props.phrases.delete)}
                                    ${listen('click', () => {
                                        dispatch(new events.delete());
                                        dispatch(new events.done());
                                    })}
                                ></${CoreButton}>
                                <${CoreButton}
                                    class="tcnft-core-button-text-button ${
                                        revertEnabled ? 'warning-button' : ''
                                    } ${props.canRevert ? '' : 'hidden'}"
                                    ${assign(
                                        CoreButton.props.label,
                                        revertEnabled ? props.phrases.revert : props.phrases.cancel,
                                    )}
                                    ${listen('click', () => {
                                        if (!props.validEntries) {
                                            dispatch(new events.delete());
                                        } else if (revertEnabled) {
                                            dispatch(new events.revert());
                                        }
                                        dispatch(new events.done());
                                    })}
                                ></${CoreButton}>
                                <${CoreButton}
                                    class="tcnft-core-button-accept-theme"
                                    ${assign(CoreButton.props.label, props.phrases.done)}
                                    ${assign(CoreButton.props.clickable, props.validEntries)}
                                    ${listen('click', () => {
                                        dispatch(new events.done());
                                    })}
                                ></${CoreButton}>
                            `
                        : html`
                                <${CoreButton}
                                    class="tcnft-core-button-text-button tcnft-core-button-text-button-primary-accent"
                                    ${assign(CoreButton.props.label, props.phrases.edit)}
                                    ${listen('click', () => {
                                        dispatch(new events.edit());
                                    })}
                                ></${CoreButton}>
                            `}
                </div>
            `;
        } else {
            return html`
                <div class="buttons">
                    <slot></slot>
                    <${CoreButton}
                        ${assign(CoreButton.props.label, props.phrases.create(props.creationType))}
                        ${listen('click', () => {
                            dispatch(new events.createNew());
                        })}
                    ></${CoreButton}>
                </div>
            `;
        }
    },
});
