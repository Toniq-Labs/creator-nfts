import {addInCategoryNftRequirement} from '@frontend/src/canisters/nft/creator-content/creator-content-transforms';
import {ContentCreatorDashboardData} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {assertValidDashboardData} from '@frontend/src/canisters/nft/creator-content/creator-content-validation';
import {NftUser} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CloseModalsEvent} from '@frontend/src/ui/global-events/close-modals.event';
import {TcnftAppFullRoute} from '@frontend/src/ui/routes/app-routes';
import {extractErrorMessage} from 'augment-vir/dist';
import {assign, css, html, listen} from 'element-vir';
import {TemplateResult} from 'lit';
import {UpdateCreatorContentEvent} from '../../global-events/update-creator-content.event';
import {CoreButton} from '../design-system/core-button.element';
import {CoreTextInput} from '../design-system/core-text-input.element';
import {LoadingIndicator} from '../loading/loading-indicator.element';

function updateIsValidInputJson(
    props: NonNullable<typeof EditJsonModal.initInput.props>,
): ContentCreatorDashboardData | undefined {
    try {
        const newJson = props.currentJson || '{}';
        const newCreatorData = addInCategoryNftRequirement(JSON.parse(newJson));
        assertValidDashboardData(newCreatorData);
        props.invalidJson = false;
        props.caption = props.phrases.valid;
        return newCreatorData;
    } catch (error) {
        console.error(error);
        const errorMessage = extractErrorMessage(error);
        props.invalidJson = true;
        props.caption = props.phrases.invalid(errorMessage);
        return undefined;
    }
}

export const EditJsonModal = defineCreatorNftElement({
    tagName: 'tcnft-edit-json-modal',
    props: {
        currentRoute: undefined as TcnftAppFullRoute | undefined,
        currentUser: undefined as NftUser | undefined,
        currentJson: undefined as string | undefined,
        invalidJson: false,
        caption: '',
        phrases: {
            save: 'Done',
            validate: 'Validate',
            valid: 'Data is valid',
            invalid: (reason: string) => `Data is not valid: ${reason}`,
            recommendation: 'Recommended for advanced users only.',
        },
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        ${CoreTextInput} {
            width: 800px;
            max-width: 100%;
            min-height: 300px;
        }

        footer {
            gap: 8px;
            display: flex;
            justify-content: flex-end;
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        if (!props.currentUser) {
            return html``;
        }

        if (!props.currentUser.isContentCreator) {
            return html``;
        }

        const isLoading = props.currentJson == undefined;

        const loadingTemplate: TemplateResult | string = html`
            <${LoadingIndicator}
                ${assign(LoadingIndicator.props.isLoading, true)}
            ></${LoadingIndicator}>
        `;

        return isLoading
            ? loadingTemplate
            : html`
            <p>
                ${props.phrases.recommendation}
            </p>
                <${CoreTextInput}
                    class="${props.invalidJson ? 'tcnft-core-text-input-warning' : ''}"
                    ${assign(CoreTextInput.props.multiline, true)}
                    ${assign(CoreTextInput.props.noAutoStuff, true)}
                    ${assign(CoreTextInput.props.allowMultilineEnter, true)}
                    ${assign(CoreTextInput.props.autoFocus, true)}
                    ${assign(CoreTextInput.props.fullHeight, true)}
                    ${assign(CoreTextInput.props.value, props.currentJson)}
                    ${assign(CoreTextInput.props.caption, props.caption)}
                    ${listen(CoreTextInput.events.valueChange, (event) => {
                        props.caption = '';
                        props.currentJson = event.detail;
                        props.invalidJson = false;
                    })}
                ></${CoreTextInput}>
                <footer>
                    <${CoreButton}
                        class="tcnft-core-button-accept-theme tcnft-core-button-text-button"
                        ${assign(CoreButton.props.label, props.phrases.validate)}
                        ${assign(CoreButton.props.clickable, !props.invalidJson)}
                        ${listen('click', () => {
                            updateIsValidInputJson(props);
                        })}
                    ></${CoreButton}>
                    <${CoreButton}
                        class="tcnft-core-button-accept-theme"
                        ${assign(CoreButton.props.label, props.phrases.save)}
                        ${assign(CoreButton.props.clickable, !props.invalidJson)}
                        ${listen('click', () => {
                            const newContentCreatorData = updateIsValidInputJson(props);
                            if (newContentCreatorData) {
                                genericDispatch(
                                    new UpdateCreatorContentEvent(newContentCreatorData),
                                );
                                genericDispatch(new CloseModalsEvent());
                            }
                        })}
                    ></${CoreButton}>
                </footer>
            `;
    },
});
