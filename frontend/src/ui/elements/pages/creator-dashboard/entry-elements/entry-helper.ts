import {assign, html, listen} from 'element-vir';
import {TemplateResult} from 'lit';
import {SharedDashboardEntry} from './shared-dashboard-entry.element';

export const standardEntryPropsDefaults = {
    canRevert: false,
    editing: false,
    modified: false,
};

export type StandardEntryProps = typeof standardEntryPropsDefaults;

export function wrapInDashboardEntry({
    creationType,
    validData,
    entryExists,
    editingSlot,
    previewSlot,
    props,
}: {
    creationType: string;
    validData: boolean;
    entryExists: boolean;
    editingSlot: TemplateResult;
    previewSlot: TemplateResult;
    props: StandardEntryProps;
}): TemplateResult {
    if (!entryExists) {
        props.editing = false;
    } else if (!validData) {
        props.editing = true;
    }

    return html`
        <${SharedDashboardEntry}
            class="${props.editing ? 'editing' : ''}"
            ${assign(SharedDashboardEntry.props.entryExists, entryExists)}
            ${assign(SharedDashboardEntry.props.creationType, creationType)}
            ${assign(SharedDashboardEntry.props.validEntries, validData)}
            ${assign(SharedDashboardEntry.props.editing, props.editing)}
            ${assign(SharedDashboardEntry.props.modified, props.modified)}
            ${assign(SharedDashboardEntry.props.canRevert, props.canRevert)}
            ${listen(SharedDashboardEntry.events.done, () => {
                props.editing = false;
            })}
            ${listen(SharedDashboardEntry.events.edit, () => {
                props.editing = true;
            })}
        >
            <slot></slot>
            ${props.editing ? editingSlot : ''}
            ${entryExists ? previewSlot : ''}
        </${SharedDashboardEntry}>
    `;
}
