import {CreatorCategory} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CategoryButton} from '@frontend/src/ui/elements/design-system/category-button.element';
import {CoreButton} from '@frontend/src/ui/elements/design-system/core-button.element';
import {
    CoreNumberInput,
    coreNumberInputWidthVarName,
} from '@frontend/src/ui/elements/design-system/core-number-input.element';
import {
    symbolFontVar,
    themeForegroundLightAccentColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, defineElementEvent, html, listen} from 'element-vir';
import {TemplateResult} from 'lit';
import {CoreTextInput} from '../../../design-system/core-text-input.element';
import {standardEntryPropsDefaults, wrapInDashboardEntry} from './entry-helper';

export const CategoryEntry = defineCreatorNftElement({
    tagName: 'tcnft-category-entry',
    props: {
        ...standardEntryPropsDefaults,
        category: undefined as undefined | CreatorCategory,
        phrases: {
            mintRequirement: 'NFT Requirement',
            mintRequirementExplanation:
                'Number of minted NFTs required for this category to show up in the nav. Usually this is just left at 0.',
            name: 'Name',
            namePlaceholder: 'Enter category name',
            mustHaveName: 'Category name is required.',
            categoryType: 'Category',
            position: 'Position',
            id: 'Id',
            toSeeRequirement: (count?: number) => `NFTs required to see: ${count ?? 0}`,
        },
    },
    events: {
        categoryChange: defineElementEvent<CreatorCategory>(),
        changeOrder: defineElementEvent<{category: CreatorCategory; increase: boolean}>(),
    },
    styles: css`
        :host {
            display: block;
            overflow: hidden;
        }

        .preview {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .preview .name {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .preview ${CoreButton} {
            align-self: flex-start;
        }

        .preview span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .title {
            font-weight: bold;
        }

        ${CategoryButton} {
            pointer-events: none;
        }

        ${CoreNumberInput} {
            ${coreNumberInputWidthVarName}: 100px;
        }

        ${CoreTextInput} {
            flex-grow: 1;
        }

        div.editing {
            border-bottom: 1px solid ${themeForegroundLightAccentColorVar};
            padding-bottom: 8px;
            margin-bottom: 16px;
            display: flex;
            gap: 16px;
        }

        .order-arrows {
            font-size: 0.8em;
            font-family: ${symbolFontVar};
            display: flex;
            flex-direction: column;
            gap: 2px;
            --tcnft-core-button-padding: 0.25em 0.5em;
        }
    `,
    renderCallback: ({props, dispatch, events}) => {
        const nameInputCaption = props.category?.categoryLabel ? '' : props.phrases.mustHaveName;
        const validData = !!props.category?.categoryLabel && !isNaN(props.category?.nftRequirement);

        const editingSlot: TemplateResult = html`
            <div class="editing">
                <${CoreTextInput}
                    class="${props.category?.categoryLabel ? '' : 'tcnft-core-text-input-warning'}"
                    ${listen(CoreTextInput.events.valueChange, (event) => {
                        if (props.category) {
                            props.category = {
                                ...props.category,
                                categoryLabel: event.detail,
                            };
                            dispatch(new events.categoryChange(props.category));
                        }
                    })}
                    ${assign(CoreTextInput.props.value, props.category?.categoryLabel)}
                    ${assign(CoreTextInput.props.label, props.phrases.name)}
                    ${assign(CoreTextInput.props.caption, nameInputCaption)}
                    ${assign(CoreTextInput.props.placeholder, props.phrases.namePlaceholder)}
                ></${CoreTextInput}>
                    <div class="order-arrows">
                        <${CoreButton}
                            ${listen('click', () => {
                                if (props.category) {
                                    dispatch(
                                        new events.changeOrder({
                                            category: props.category,
                                            increase: false,
                                        }),
                                    );
                                }
                            })}
                            ${assign(CoreButton.props.label, '▲')}
                        ></${CoreButton}>
                        <${CoreButton}
                        ${listen('click', () => {
                            if (props.category) {
                                dispatch(
                                    new events.changeOrder({
                                        category: props.category,
                                        increase: true,
                                    }),
                                );
                            }
                        })}
                            ${assign(CoreButton.props.label, '▼')}
                        ></${CoreButton}>
                    </div>
                <!--
                <${CoreNumberInput}
                    class="tcnft-core-number-input-full-color-caption"
                    ${assign(
                        CoreNumberInput.props.value,
                        props.category ? Number(props.category.nftRequirement) : 0,
                    )}
                    ${assign(CoreNumberInput.props.label, props.phrases.mintRequirement)}
                    ${assign(CoreNumberInput.props.minValue, 0)}
                    ${assign(
                        CoreNumberInput.props.caption,
                        props.phrases.mintRequirementExplanation,
                    )}
                    ${listen(CoreNumberInput.events.valueChange, (event) => {
                        if (props.category) {
                            props.category = {
                                ...props.category,
                                nftRequirement: event.detail ?? 0,
                            };
                            dispatch(new events.categoryChange(props.category));
                        }
                    })}
                ></${CoreNumberInput}>
                -->
            </div>
        `;
        const previewSlot: TemplateResult = html`
            <div class="preview">
                <span>
                    <span class="title">${props.phrases.id}:</span>
                    ${props.category?.id}
                </span>
                <${CategoryButton}
                    ${assign(CategoryButton.props.categoryName, props.category?.categoryLabel)}
                >
                </${CategoryButton}>
                <!--
                <span>
                    ${props.phrases.toSeeRequirement(props.category?.nftRequirement)}
                </span>
                -->
            </div>
        `;

        return wrapInDashboardEntry({
            creationType: props.phrases.categoryType,
            validData,
            entryExists: !!props.category,
            editingSlot,
            previewSlot,
            props,
        });
    },
});
